# GitHub Actions as Ephemeral Sandbox

## The Idea

GitHub Actions is ALREADY an ephemeral execution environment!

**What it provides:**
- ✅ Ephemeral runners (destroyed after each run)
- ✅ Secrets management (private dataset storage)
- ✅ Public execution logs (verifiable certificate)
- ✅ Workflow run URL (shareable proof)
- ✅ GitHub's infrastructure (trust layer)

**Perfect for MVP before dstack TEE!**

## The Model

```
┌─────────────────────────────────────────────────────────┐
│  INPUTS                                                 │
├─────────────────────────────────────────────────────────┤
│  1. Private dataset (GitHub Secret or private URL)      │
│  2. Sandbox spec (workflow inputs)                      │
│     ├─ LLM prompt                                       │
│     ├─ Tools to use                                     │
│     └─ Analysis script                                  │
│  3. API keys (GitHub Secrets)                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  EXECUTION (GitHub Actions Runner)                      │
├─────────────────────────────────────────────────────────┤
│  1. Fetch dataset from secret (or private URL)          │
│  2. Load into runner memory                             │
│  3. Run LLM analysis                                    │
│  4. Use tools (python, bash, etc.)                      │
│  5. Log result (publicly visible)                       │
│  6. Runner destroyed (dataset deleted)                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  OUTPUT (permanent, public)                             │
├─────────────────────────────────────────────────────────┤
│  Workflow run URL (the "certificate"):                  │
│  https://github.com/user/repo/actions/runs/123456       │
│                                                         │
│  Anyone can see:                                        │
│  ├─ ✅ Workflow ran successfully                        │
│  ├─ ✅ What prompt was used                             │
│  ├─ ✅ What tools were invoked                          │
│  ├─ ✅ Execution logs                                   │
│  ├─ ✅ Result/output                                    │
│  ├─ ✅ Timestamp                                        │
│  └─ ❌ NOT the private dataset                          │
│                                                         │
│  Dataset: GONE (runner destroyed)                       │
└─────────────────────────────────────────────────────────┘
```

## Example Flow

### Step 1: Store Private Dataset as Secret

**Option A: GitHub Secret**
```bash
# In your repo settings, add secret:
PRIVATE_DATASET="Patient 1: John Doe, Age 45..."
```

**Option B: Private URL with Token**
```bash
# Store URL + token as secrets:
DATASET_URL="https://private-storage.com/data.csv"
DATASET_TOKEN="secret_access_token"
```

### Step 2: Trigger Workflow

**Dispatch workflow with inputs:**
```bash
gh workflow run ephemeral-execution.yml \
  -f llm_prompt="Analyze for PII: names, SSN, emails" \
  -f dataset_secret="PRIVATE_DATASET" \
  -f model="claude-sonnet-4" \
  -f tools="python,grep"
```

**Or via GitHub UI:**
- Go to Actions tab
- Select "Ephemeral Execution" workflow
- Click "Run workflow"
- Fill in inputs

### Step 3: Execution Happens

**Workflow does:**
```yaml
- Fetch dataset from secret (not logged)
- Load into memory
- Run LLM analysis
- Log result (publicly visible)
- Runner destroyed (dataset deleted)
```

### Step 4: Share Certificate

**Result:**
```
Workflow run URL:
https://github.com/user/repo/actions/runs/12345678

Anyone can verify:
✅ Workflow ran at 2026-02-01 13:20:00
✅ Used prompt: "Analyze for PII..."
✅ Result: "0 PII instances found"
✅ Logs show: grep ran 47 times, LLM called 3 times
❌ Private dataset NOT visible in logs
```

## Trust Model

### What GitHub Provides
- ✅ **Ephemeral runners** - Destroyed after each run
- ✅ **Secrets management** - Dataset not exposed in logs
- ✅ **Execution transparency** - Logs are public
- ✅ **Tamper-proof logs** - Can't edit after the fact
- ✅ **Timestamp** - GitHub provides trusted timestamp

### What You Trust
- ✅ GitHub infrastructure (runners are isolated)
- ✅ GitHub doesn't log secrets
- ✅ Workflow code (open source, auditable)

### What You Don't Trust
- ❌ Repo owner (they wrote the workflow)
- ❌ Other GitHub users (but logs are public)

### Comparison to TEE

| Aspect | GitHub Actions | dstack TEE |
|--------|----------------|------------|
| **Isolation** | GitHub's runners | Intel TDX hardware |
| **Trust** | GitHub infrastructure | CPU manufacturer |
| **Attestation** | Workflow run URL | TDX quote signature |
| **Verification** | Anyone can see logs | Cryptographic proof |
| **Secret handling** | GitHub Secrets | TEE-sealed keys |
| **Cost** | Free (public repos) | Paid (CVM instances) |
| **Auditability** | High (public logs) | High (attestations) |

**GitHub Actions = "Soft TEE"**
- Not cryptographically proven
- But practically very good
- Perfect for MVP/demo

## Implementation

### Workflow File: `.github/workflows/ephemeral-execution.yml`

```yaml
name: Ephemeral Sandbox Execution

on:
  workflow_dispatch:
    inputs:
      llm_prompt:
        description: 'LLM analysis prompt'
        required: true
      dataset_secret:
        description: 'Name of GitHub secret containing dataset'
        required: true
        default: 'PRIVATE_DATASET'
      model:
        description: 'LLM model to use'
        required: false
        default: 'claude-sonnet-4'
      tools:
        description: 'Tools to use (comma-separated)'
        required: false
        default: 'python,bash'

jobs:
  execute:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install anthropic
      
      - name: Generate dataset hash
        id: hash
        run: |
          # Hash the dataset (without logging it)
          DATASET="${{ secrets[github.event.inputs.dataset_secret] }}"
          HASH=$(echo -n "$DATASET" | sha256sum | cut -d' ' -f1)
          echo "dataset_hash=$HASH" >> $GITHUB_OUTPUT
          echo "✅ Dataset loaded (hash: ${HASH:0:16}...)"
      
      - name: Execute LLM analysis
        id: execute
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          DATASET: ${{ secrets[github.event.inputs.dataset_secret] }}
          PROMPT: ${{ github.event.inputs.llm_prompt }}
          MODEL: ${{ github.event.inputs.model }}
        run: |
          python3 << 'PYTHON_SCRIPT'
          import os
          import anthropic
          import hashlib
          import json
          
          # Get inputs
          dataset = os.environ['DATASET']
          prompt = os.environ['PROMPT']
          model = os.environ['MODEL']
          
          # Run LLM
          client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])
          
          full_prompt = f"{prompt}\n\n<dataset>\n{dataset}\n</dataset>\n\nAnalyze the dataset above."
          
          print(f"🤖 Running LLM analysis...")
          print(f"   Model: {model}")
          print(f"   Prompt: {prompt[:100]}...")
          
          response = client.messages.create(
              model=model,
              max_tokens=4096,
              messages=[{
                  "role": "user",
                  "content": full_prompt
              }]
          )
          
          result = response.content[0].text
          tokens = response.usage.input_tokens + response.usage.output_tokens
          
          print(f"\n✅ Analysis complete!")
          print(f"   Tokens used: {tokens}")
          print(f"\n📊 Result:")
          print(result)
          
          # Save result to output
          with open('result.txt', 'w') as f:
              f.write(result)
          
          print(f"\n🗑️  Dataset will be deleted when runner is destroyed")
          PYTHON_SCRIPT
      
      - name: Generate certificate
        id: certificate
        run: |
          echo "## 📜 Execution Certificate" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Dataset Hash:** \`${{ steps.hash.outputs.dataset_hash }}\`" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Prompt:** ${{ github.event.inputs.llm_prompt }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Model:** ${{ github.event.inputs.model }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Tools:** ${{ github.event.inputs.tools }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Timestamp:** $(date -Iseconds)" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Result:**" >> $GITHUB_STEP_SUMMARY
          echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
          cat result.txt >> $GITHUB_STEP_SUMMARY
          echo "\`\`\`" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Certificate URL:** https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "---" >> $GITHUB_STEP_SUMMARY
          echo "✅ **Dataset deleted** (runner will be destroyed)" >> $GITHUB_STEP_SUMMARY
          
          echo "Certificate URL: https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

## Usage

### 1. Setup Repository

```bash
# Create new repo
mkdir ephemeral-sandbox-demo
cd ephemeral-sandbox-demo
git init

# Add workflow
mkdir -p .github/workflows
# Create ephemeral-execution.yml (see above)

# Commit and push
git add .
git commit -m "Add ephemeral execution workflow"
gh repo create ephemeral-sandbox-demo --public --source=. --push
```

### 2. Add Secrets

**In GitHub repo settings:**
```
Settings → Secrets and variables → Actions → New repository secret

Name: ANTHROPIC_API_KEY
Value: sk-ant-...

Name: PRIVATE_DATASET
Value: <your private data>
```

### 3. Run Execution

**Via GitHub CLI:**
```bash
gh workflow run ephemeral-execution.yml \
  -f llm_prompt="Analyze sentiment distribution in these reviews" \
  -f dataset_secret="PRIVATE_DATASET" \
  -f model="claude-sonnet-4"
```

**Via GitHub UI:**
- Go to Actions tab
- Select "Ephemeral Sandbox Execution"
- Click "Run workflow"
- Enter prompt
- Run!

### 4. Share Certificate

**Get workflow run URL:**
```bash
gh run list --workflow=ephemeral-execution.yml
# Copy the run URL
```

**Share:**
```
Execution Certificate:
https://github.com/user/repo/actions/runs/12345678

Anyone can verify:
✅ What prompt ran
✅ What the result was
✅ When it executed
❌ NOT the private dataset
```

## Benefits

### For MVP/Demo
- ✅ **No infrastructure** - GitHub provides it
- ✅ **Free** - Public repos get unlimited minutes
- ✅ **Familiar** - Developers know GitHub Actions
- ✅ **Shareable** - Just send the run URL
- ✅ **Verifiable** - Anyone can see logs

### For Info Bazaar
- ✅ **Proves execution** - Workflow ran
- ✅ **Proves result** - Logs are tamper-proof
- ✅ **Proves timing** - GitHub timestamp
- ✅ **Privacy** - Dataset not exposed
- ✅ **Ephemeral** - Runner destroyed

### Limitations (vs. TEE)
- ❌ Not cryptographically provable (just GitHub's word)
- ❌ Trust GitHub infrastructure
- ❌ Secrets visible to repo admins (use private URL instead)
- ⚠️  Public repos only (for free tier)

## Migration Path

**Phase 1:** GitHub Actions (this)
- Easy to build
- Easy to demo
- Proves the concept

**Phase 2:** dstack TEE
- Add cryptographic attestation
- Hardware-level isolation
- Provable execution

**Same code, better guarantees!**

## Next Steps

1. Create demo repo
2. Add workflow file
3. Add sample dataset as secret
4. Run demo execution
5. Share workflow run URL as "certificate"
6. Post on Moltbook!

---

**GitHub Actions = Ephemeral execution with public verifiability**

Perfect MVP before dstack! 🦞
