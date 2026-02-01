#!/usr/bin/env python3
"""Generate a snapshot of the orbital dynamics visualization"""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, Circle
from mpl_toolkits.mplot3d import Axes3D

# Orbital parameters (matching visualizer defaults)
a = 1.0  # AU
e = 0.3
i = 60 * np.pi/180  # degrees to radians
omega = 45 * np.pi/180  # arg of periastron
M_p = 10  # Earth masses
M_star = 1.0  # Solar masses
distance_pc = 10

# Compute orbit
n_points = 100
theta = np.linspace(0, 2*np.pi, n_points)
r = a * (1 - e**2) / (1 + e * np.cos(theta))

# Orbital plane coordinates
x_orb = r * np.cos(theta)
y_orb = r * np.sin(theta)

# Rotate by argument of periastron
x_rot = x_orb * np.cos(omega) - y_orb * np.sin(omega)
y_rot = x_orb * np.sin(omega) + y_orb * np.cos(omega)

# 3D coordinates (rotate by inclination)
x_3d = x_rot
y_3d = y_rot * np.cos(i)
z_3d = y_rot * np.sin(i)

# Sky projection (what DI sees)
x_sky = x_3d
y_sky = y_3d

# Stellar wobble (astrometry)
mass_ratio = M_p / (M_star * 333000)  # M_earth / M_sun
x_wobble = -mass_ratio * x_3d
y_wobble = -mass_ratio * y_3d

# Convert to mas at 10 pc (1 AU = 100 mas at 10 pc)
mas_per_au = 100
x_wobble_mas = x_wobble * mas_per_au
y_wobble_mas = y_wobble * mas_per_au

# Create figure with 3 panels
fig = plt.figure(figsize=(16, 5))
fig.patch.set_facecolor('#1a1a2e')

# Panel 1: 3D True Orbit
ax1 = fig.add_subplot(131, projection='3d')
ax1.set_facecolor('#0d1117')
ax1.plot(x_3d, y_3d, z_3d, 'c-', linewidth=2, alpha=0.8, label='Planet orbit')
ax1.plot([x_3d[0]], [y_3d[0]], [z_3d[0]], 'co', markersize=8, label='Planet')
ax1.plot([0], [0], [0], 'y*', markersize=15, label='Star')
ax1.set_xlabel('X (AU)', color='#eee')
ax1.set_ylabel('Y (AU)', color='#eee')
ax1.set_zlabel('Z (AU)', color='#eee')
ax1.set_title('3D True Orbit', color='#64b5f6', fontsize=14, pad=10)
ax1.tick_params(colors='#888')
ax1.grid(alpha=0.2)
ax1.legend(facecolor='#1a1a2e', edgecolor='#444', labelcolor='#eee', fontsize=9)
lim = max(a * 1.2, 1.5)
ax1.set_xlim([-lim, lim])
ax1.set_ylim([-lim, lim])
ax1.set_zlim([-lim, lim])

# Panel 2: Sky Projection (what DI measures)
ax2 = fig.add_subplot(132)
ax2.set_facecolor('#0d1117')
ax2.plot(x_sky, y_sky, 'c-', linewidth=2, alpha=0.8, label='Projected orbit')
ax2.plot(x_sky[0], y_sky[0], 'co', markersize=8, label='Planet')
ax2.plot(0, 0, 'y*', markersize=15, label='Star')
ax2.set_xlabel('RA offset (AU)', color='#eee')
ax2.set_ylabel('Dec offset (AU)', color='#eee')
ax2.set_title('Sky Projection (DI Observable)', color='#64b5f6', fontsize=14, pad=10)
ax2.tick_params(colors='#888')
ax2.grid(alpha=0.2, color='#444')
ax2.set_aspect('equal')
ax2.legend(facecolor='#1a1a2e', edgecolor='#444', labelcolor='#eee', fontsize=9)
ax2.set_xlim([-lim, lim])
ax2.set_ylim([-lim, lim])

# Panel 3: Stellar Wobble (Astrometry)
ax3 = fig.add_subplot(133)
ax3.set_facecolor('#0d1117')
ax3.plot(x_wobble_mas, y_wobble_mas, 'm-', linewidth=2, alpha=0.8, label='Stellar wobble')
ax3.plot(x_wobble_mas[0], y_wobble_mas[0], 'mo', markersize=8)
ax3.plot(0, 0, 'y*', markersize=15, label='Star barycenter')
ax3.set_xlabel('RA offset (μas)', color='#eee')
ax3.set_ylabel('Dec offset (μas)', color='#eee')
ax3.set_title('Stellar Wobble (Astrometry)', color='#64b5f6', fontsize=14, pad=10)
ax3.tick_params(colors='#888')
ax3.grid(alpha=0.2, color='#444')
ax3.set_aspect('equal')
ax3.legend(facecolor='#1a1a2e', edgecolor='#444', labelcolor='#eee', fontsize=9)
wobble_lim = max(abs(x_wobble_mas).max(), abs(y_wobble_mas).max()) * 1.2
ax3.set_xlim([-wobble_lim, wobble_lim])
ax3.set_ylim([-wobble_lim, wobble_lim])

# Add metrics text
metrics_text = f"""Orbital Parameters:
• a = {a:.2f} AU
• e = {e:.2f}
• i = {i*180/np.pi:.0f}°
• ω = {omega*180/np.pi:.0f}°
• M_p = {M_p:.0f} M⊕

Projected semi-major: {a * np.sin(i):.2f} AU
Wobble amplitude: {wobble_lim:.1f} μas"""

fig.text(0.02, 0.98, metrics_text, 
         transform=fig.transFigure, 
         fontsize=9, 
         verticalalignment='top',
         color='#64b5f6',
         fontfamily='monospace',
         bbox=dict(boxstyle='round', facecolor='#1a1a2e', 
                   edgecolor='#444', alpha=0.8))

plt.suptitle('Why Direct Imaging + Astrometry break the mass degeneracy', 
             color='#eee', fontsize=16, y=0.98)
fig.text(0.5, 0.02, 
         'Same sky projection (DI), different true orbits → different stellar wobble (Astrometry)', 
         ha='center', color='#888', fontsize=11)

plt.tight_layout(rect=[0, 0.03, 1, 0.96])
plt.savefig('/home/node/.openclaw/workspace/maths-and-lean/visualizer_snapshot.png', 
            dpi=150, facecolor='#1a1a2e', edgecolor='none')
print("Saved to visualizer_snapshot.png")
