# External References

## Visualizers (xiaziyna.github.io)
Cloned from Jamila Taaki's site.

| File | Topic |
|------|-------|
| `astrometry_visualizer.html` | Starspot jitter vs planet wobble |
| `rm_effect.html` | Rossiter-McLaughlin effect |
| `rm_obliquity.html` | Spin-orbit obliquity |

**Key physics in astrometry_visualizer:**
- Photocenter displacement: δ/R★ ≈ f_spot × C × μ × limbDarkening
- At 10pc: 1 R_sun = 465 μas
- Shows how spots contaminate astrometric planet detection

## sympyhelpers (Dmitry Savransky)
github.com/dsavransky/sympyhelpers

Sympy wrappers for Newton-Euler and Lagrangian mechanics.

Key functions:
- `gendiffvars()` — generate θ, θdot, θddot with diffmap
- `difftotal()` — total derivative without Function(t) awkwardness
- `transportEq()` — d/dt in rotating frame
- `rotMat()`, `calcDCM()` — rotation matrices
- `DCM2angVel()` — angular velocity from DCM

## SSW2024 Notebooks (Sagan Summer Workshop)
| Notebook | Topic |
|----------|-------|
| `SSW2024_OrbitFitting.ipynb` | Orbit fitting with orbitize! |
| `SSW2024_YieldModelingTutorial1.ipynb` | Exoplanet yield modeling |
| `SSW2024_ImagingExoplanets.ipynb` | Direct imaging |

## Papers
- `taaki_astrometric_jitter_2511.07706.pdf` — "Identifiability of Rotating Stellar Surfaces from Astrometric Jitter" (Taaki, Corrales, Hero 2025)
