"""
Fisher information analysis: Direct Imaging + Astrometry for planet mass

Question: What is the information gain on M_p when DI constrains orbital params?

Orbital elements: {a, e, i, Ω, ω, τ, M_p}
- DI constrains: a/d, e, i, Ω, ω (but NOT M_p directly)
- Astrometry constrains: M_p × a × sin(i) / d  (degenerate!)

Combined: DI breaks the {a, i} degeneracy → astrometry isolates M_p
"""

import sympy as sp
from sympy import symbols, cos, sin, sqrt, Matrix, simplify, pi, Function, Derivative
from sympy import lambdify
import numpy as np

# Orbital parameters
a, e, i, Omega, omega, tau = symbols('a e i Omega omega tau', real=True, positive=True)
M_p, M_star, d = symbols('M_p M_star d', real=True, positive=True)
t, P = symbols('t P', real=True)  # time, period
n = 2*pi/P  # mean motion

# Eccentric anomaly (implicit - we'll use true anomaly for now)
nu = symbols('nu', real=True)  # true anomaly

# Orbital radius
r = a * (1 - e**2) / (1 + e*cos(nu))

# Position in orbital plane (x toward periastron, y in orbit direction)
x_orb = r * cos(nu)
y_orb = r * sin(nu)

# Rotation matrices for 3D orientation
def Rz(angle):
    return Matrix([
        [cos(angle), -sin(angle), 0],
        [sin(angle), cos(angle), 0],
        [0, 0, 1]
    ])

def Rx(angle):
    return Matrix([
        [1, 0, 0],
        [0, cos(angle), -sin(angle)],
        [0, sin(angle), cos(angle)]
    ])

# Thiele-Innes transformation: orbital plane → sky plane
# Standard: rotate by ω, then i, then Ω
R_sky = Rz(Omega) @ Rx(i) @ Rz(omega)

# Planet position in sky frame (observer along +Z)
pos_orb = Matrix([x_orb, y_orb, 0])
pos_sky = R_sky @ pos_orb

# Sky-projected position (what DI sees)
X_DI = pos_sky[0]  # RA direction
Y_DI = pos_sky[1]  # Dec direction
# Z_DI = pos_sky[2]  # along line of sight (not directly observed)

# Angular separation and PA (Direct Imaging observables)
sep = sqrt(X_DI**2 + Y_DI**2) / d  # arcsec if d in same units as a
PA = sp.atan2(X_DI, Y_DI)  # position angle

# Stellar reflex motion (Astrometry observable)
# Star wobbles opposite to planet, scaled by mass ratio
# Δx_star = -(M_p/M_star) * x_planet
wobble_scale = M_p / M_star
X_astro = -wobble_scale * X_DI / d  # stellar wobble in RA
Y_astro = -wobble_scale * Y_DI / d  # stellar wobble in Dec

print("=== Observables ===")
print(f"\nDI separation (angular): sep = sqrt(X² + Y²)/d")
print(f"DI position angle: PA = atan2(X, Y)")
print(f"\nAstrometry wobble X: {X_astro}")
print(f"Astrometry wobble Y: {Y_astro}")

# Key insight: astrometry signal is proportional to M_p * (a/d) * geometric_factor
# If DI constrains a and i, the geometric factor is known → M_p isolated

print("\n=== Fisher Information Setup ===")

# Parameters of interest
params = [a, e, i, Omega, omega, M_p]
print(f"Parameters: {params}")

# For Fisher matrix, we need derivatives of observables w.r.t. parameters
# F_ij = sum_t (1/σ²) * (∂obs/∂θ_i) * (∂obs/∂θ_j)

# Derivative of astrometric wobble w.r.t. M_p
dX_dMp = sp.diff(X_astro, M_p)
dY_dMp = sp.diff(Y_astro, M_p)

print(f"\n∂X_astro/∂M_p = {simplify(dX_dMp)}")
print(f"∂Y_astro/∂M_p = {simplify(dY_dMp)}")

# The key: these derivatives are proportional to the orbit geometry
# If we know the geometry from DI, we know these derivatives exactly

# Derivative of astrometric wobble w.r.t. orbital params
print("\n=== Degeneracies ===")
dX_da = sp.diff(X_astro, a)
dX_di = sp.diff(X_astro, i)
print(f"∂X_astro/∂a = {simplify(dX_da)}")
print(f"∂X_astro/∂i = {simplify(dX_di)}")

# Note: if a and i appear in X_astro in a degenerate way with M_p,
# then without DI constraints, M_p estimation suffers

print("\n=== Information Gain Analysis ===")
print("""
Scenario A: Astrometry only
- Must estimate {a, e, i, Ω, ω, M_p} jointly
- Degeneracy: M_p × a × sin(i) confounded
- Large uncertainty on M_p

Scenario B: DI + Astrometry
- DI constrains {a, e, i, Ω, ω} (orbit shape)
- Astrometry then isolates M_p
- Fisher info for M_p = full astrometric Fisher with orbit params fixed

The "gain" is the ratio of Fisher information:
    Gain = F_Mp(DI+Astro) / F_Mp(Astro only)
         = 1 / (1 - R²)
where R² is the squared correlation between M_p and nuisance params
""")

# Let's compute the structure symbolically
# Thiele-Innes constants (standard parameterization for visual orbits)
A = a * (cos(omega)*cos(Omega) - sin(omega)*sin(Omega)*cos(i))
B = a * (cos(omega)*sin(Omega) + sin(omega)*cos(Omega)*cos(i))
F = a * (-sin(omega)*cos(Omega) - cos(omega)*sin(Omega)*cos(i))
G = a * (-sin(omega)*sin(Omega) + cos(omega)*cos(Omega)*cos(i))

print("\n=== Thiele-Innes Constants ===")
print("(Standard basis for visual orbit fitting)")
print(f"A = {A}")
print(f"B = {B}")
print(f"F = {F}")
print(f"G = {G}")

print("""
In Thiele-Innes basis:
  X = A*x + F*y  (where x,y are normalized orbit coords)
  Y = B*x + G*y

DI measures {A,B,F,G,e,P} → 6 params but only 5 independent orbital elements!
The 6th constraint relates to a*cos(i) vs a*sin(i) - partial inclination info.

Astrometry adds: wobble ∝ M_p * {A,B,F,G}
With DI-constrained {A,B,F,G}, astrometry directly yields M_p.
""")
