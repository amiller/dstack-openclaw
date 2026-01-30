#!/usr/bin/env node
/**
 * Skill Verifier - Runs skill tests in isolated Docker containers
 * and generates TEE attestations using dstack
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Configuration
const DSTACK_SIMULATOR = path.join(__dirname, '../../dstack/sdk/simulator/dstack.sock');
const DOCKER_HOST = process.env.DOCKER_HOST || 'tcp://10.141.207.134:2375';

class SkillVerifier {
  constructor() {
    this.workDir = path.join(__dirname, 'work');
    if (!fs.existsSync(this.workDir)) {
      fs.mkdirSync(this.workDir, { recursive: true });
    }
  }

  /**
   * Verify a skill package
   * @param {string} skillPackagePath - Path to skill tarball or directory
   * @returns {Object} Verification result with attestation
   */
  async verify(skillPackagePath) {
    const startTime = Date.now();
    const skillId = path.basename(skillPackagePath, path.extname(skillPackagePath));
    const extractDir = path.join(this.workDir, skillId);

    console.log(`\n🔍 Verifying skill: ${skillId}`);

    try {
      // Step 1: Extract skill package
      console.log('📦 Extracting skill package...');
      this.extractSkill(skillPackagePath, extractDir);

      // Step 2: Load and validate manifest
      console.log('📋 Loading manifest...');
      const manifest = this.loadManifest(extractDir);

      // Step 3: Run tests in Docker
      console.log('🧪 Running tests in isolated container...');
      const testResult = await this.runTests(extractDir, manifest);

      // Step 4: Generate attestation
      console.log('🔐 Generating TEE attestation...');
      const attestation = await this.generateAttestation(skillId, testResult);

      // Step 5: Create final result
      const result = {
        skillId: `${manifest.name}@${manifest.version}`,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        result: testResult,
        attestation: attestation,
        manifest: {
          name: manifest.name,
          version: manifest.version,
          description: manifest.description
        }
      };

      console.log(`\n✅ Verification complete! Passed: ${testResult.passed}`);
      return result;

    } catch (error) {
      console.error(`\n❌ Verification failed: ${error.message}`);
      throw error;
    } finally {
      // Cleanup
      if (fs.existsSync(extractDir)) {
        execSync(`rm -rf ${extractDir}`);
      }
    }
  }

  /**
   * Extract skill package to directory
   */
  extractSkill(packagePath, targetDir) {
    if (fs.statSync(packagePath).isDirectory()) {
      // Copy directory
      execSync(`cp -r ${packagePath} ${targetDir}`);
    } else {
      // Extract tarball
      fs.mkdirSync(targetDir, { recursive: true });
      execSync(`tar -xzf ${packagePath} -C ${targetDir}`);
    }
  }

  /**
   * Load and validate skill manifest
   */
  loadManifest(skillDir) {
    const manifestPath = path.join(skillDir, 'SKILL.md');
    if (!fs.existsSync(manifestPath)) {
      throw new Error('No SKILL.md found in package');
    }

    const content = fs.readFileSync(manifestPath, 'utf8');
    
    // Parse frontmatter
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
      throw new Error('Invalid SKILL.md: no frontmatter found');
    }

    const manifest = {};
    match[1].split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        manifest[key.trim()] = valueParts.join(':').trim();
      }
    });

    // Validate required fields
    if (!manifest.name || !manifest.version) {
      throw new Error('Manifest missing required fields: name, version');
    }

    return manifest;
  }

  /**
   * Run skill tests in Docker container
   */
  async runTests(skillDir, manifest) {
    const containerName = `skill-test-${Date.now()}`;
    
    try {
      // Build test Dockerfile
      const dockerfile = this.generateDockerfile(manifest);
      fs.writeFileSync(path.join(skillDir, 'Dockerfile.test'), dockerfile);

      // Build image
      console.log('   Building test container...');
      execSync(`docker build -f ${skillDir}/Dockerfile.test -t ${containerName} ${skillDir}`, {
        env: { ...process.env, DOCKER_HOST },
        stdio: 'pipe'
      });

      // Run tests
      console.log('   Running tests...');
      const startTime = Date.now();
      
      let stdout = '';
      let stderr = '';
      let exitCode = 0;

      try {
        stdout = execSync(`docker run --rm ${containerName}`, {
          env: { ...process.env, DOCKER_HOST },
          encoding: 'utf8',
          timeout: 30000 // 30s timeout
        });
      } catch (error) {
        exitCode = error.status || 1;
        stdout = error.stdout || '';
        stderr = error.stderr || error.message;
      }

      const duration = Date.now() - startTime;

      return {
        passed: exitCode === 0,
        exitCode,
        stdout,
        stderr,
        duration
      };

    } finally {
      // Cleanup image
      try {
        execSync(`docker rmi ${containerName}`, {
          env: { ...process.env, DOCKER_HOST },
          stdio: 'ignore'
        });
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Generate Dockerfile for testing
   */
  generateDockerfile(manifest) {
    // Default to alpine with bash
    const baseImage = manifest.runtime || 'alpine:latest';
    
    return `FROM ${baseImage}

WORKDIR /skill

# Copy skill files
COPY . .

# Install test dependencies if specified
${manifest.test_deps ? `RUN ${manifest.test_deps}` : ''}

# Run tests
${manifest.test_command ? `CMD ${manifest.test_command}` : 'CMD ["sh", "-c", "echo \\"No test command specified\\""]'}
`;
  }

  /**
   * Generate TEE attestation using dstack
   */
  async generateAttestation(skillId, testResult) {
    // Create result hash
    const resultJson = JSON.stringify({
      skillId,
      passed: testResult.passed,
      exitCode: testResult.exitCode,
      duration: testResult.duration
    });
    
    const resultHash = crypto.createHash('sha256').update(resultJson).digest();

    // In production, this would use dstack SDK to generate real TEE quote
    // For now, simulate the structure
    
    try {
      // Try to connect to simulator
      const quote = await this.getQuote(resultHash);
      return {
        quote: quote.quote,
        resultHash: resultHash.toString('hex'),
        verifier: 'dstack-simulator',
        note: 'Simulated attestation - replace with real TEE in production'
      };
    } catch (error) {
      // Fallback if simulator not available
      return {
        quote: null,
        resultHash: resultHash.toString('hex'),
        verifier: 'none',
        note: `No TEE available: ${error.message}`
      };
    }
  }

  /**
   * Get quote from dstack simulator
   */
  async getQuote(data) {
    // This would use the dstack SDK
    // For now, return mock data
    return {
      quote: '0x' + crypto.randomBytes(64).toString('hex'),
      eventLog: []
    };
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: verifier.js <skill-package>');
    process.exit(1);
  }

  const verifier = new SkillVerifier();
  
  verifier.verify(args[0])
    .then(result => {
      console.log('\n📊 Results:');
      console.log(JSON.stringify(result, null, 2));
      
      // Save result
      const outputPath = path.join(__dirname, 'work', `${result.skillId}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
      console.log(`\n💾 Saved to: ${outputPath}`);
      
      process.exit(result.result.passed ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = SkillVerifier;
