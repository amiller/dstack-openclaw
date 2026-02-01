# Session Notes: Orbital Dynamics Visualizers

## Goal
Study and contribute to visualizers for orbital dynamics, particularly combining direct imaging (DI) and astrometry for exoplanet characterization.

## Discussion with Jamila Taaki
**Core question:** What is the "gain" in planet mass estimation when DI constrains orbital parameters?

Key insight: DI and astrometry constrain orbits in *different bases*:
- DI measures Thiele-Innes constants {A, B, F, G} — combinations of {a, i, Ω, ω}
- Astrometry measures stellar wobble ∝ M_p × a × geometric_factor
- M_p and a are multiplicatively degenerate in astrometry alone

**The degeneracy:**
```
A² + B² + F² + G² = a²(1 + cos²i)
```
DI gives this combination but NOT a and i separately. A face-on small orbit looks like an edge-on large orbit.

**Combined power:** DI constrains geometry → astrometry isolates M_p

## Sympy Analysis
Created `work/fisher_di_astrometry.py`:
- Orbital mechanics in sympy (Keplerian elements, sky projection)
- Thiele-Innes transformation
- Derivatives showing the M_p-a degeneracy structure:
  ```
  ∂X_astro/∂M_p ∝ a × (geometric terms)
  ∂X_astro/∂a   ∝ M_p × (same geometric terms)
  ```

**Sympy workflow pattern (from sympyhelpers):**
1. Define symbolically with `gendiffvars()` and diffmap
2. Derive equations of motion / transformations
3. `lambdify()` for numeric evaluation
4. Monte Carlo for uncertainties

## Visualizer Built
Created `work/di_astrometry_visualizer.html`:

**Three panels:**
| Panel | Shows | Represents |
|-------|-------|------------|
| 3D Orbit | True orbital shape | Physical reality |
| Sky Projection | Projected ellipse | What DI measures |
| Stellar Wobble | Reflex motion | What astrometry measures |

**Key feature — Degeneracy Mode:**
- Toggle ON: locks projected size
- Changing inclination auto-adjusts a to maintain DI observable
- Wobble amplitude changes → shows information DI can't provide

**Metrics displayed:**
- Projected vs true semi-major axis
- Wobble amplitude (μas)
- Inferred mass with/without a-i degeneracy

## File Structure
```
maths-and-lean/
├── refs/                    # External references only
│   ├── REFS.md             # Index of references
│   ├── xiaziyna.github.io/ # Visualizers (cloned)
│   ├── sympyhelpers/       # Sympy mechanics library (cloned)
│   ├── SSW2024_notebooks/  # Sagan workshop tutorials
│   └── taaki_*.pdf         # Astrometric jitter paper
├── work/                    # Our work
│   ├── di_astrometry_visualizer.html
│   └── fisher_di_astrometry.py
└── SESSION_NOTES.md         # This file
```

## Next Steps
- [ ] Add RV constraints to visualizer (breaks a-i degeneracy differently)
- [ ] Compute actual Fisher matrix numerically for specific systems
- [ ] Connect to orbitize! for real orbit fitting
- [ ] Quantify information gain factor as function of DI coverage
- [ ] Link sympy derivations to Lean formalization?
