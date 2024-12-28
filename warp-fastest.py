import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# Define a minimal grid for fastest rendering
x = np.linspace(-5, 5, 50)  # Reduced resolution
y = np.linspace(-5, 5, 50)
X, Y = np.meshgrid(x, y)

# Simplified warp field dynamics
def warp_field_fast(X, Y, t):
    r = np.sqrt(X**2 + Y**2)
    energy_dissipation = np.exp(-0.1 * t)  # Energy dissipation over time
    contraction = energy_dissipation * np.exp(-r**2) * np.cos(2 * np.pi * t)
    expansion = energy_dissipation * np.exp(-r**2) * np.sin(2 * np.pi * t)
    return contraction, expansion

# Initialize the figure
fig, ax = plt.subplots(figsize=(5, 5))
ax.set_xlim(-5, 5)
ax.set_ylim(-5, 5)
ax.set_aspect('equal')

# Initialize quiver and contour plots
quiver = ax.quiver(X, Y, np.zeros_like(X), np.zeros_like(Y), scale=50)
plots = {"contraction": None, "expansion": None}

# Update function for animation
def update(t):
    # Compute fields
    contraction, expansion = warp_field_fast(X, Y, t)

    # Update quiver vectors
    U = contraction * (X / np.sqrt(X**2 + Y**2 + 1e-6))  # Avoid division by zero
    V = expansion * (Y / np.sqrt(X**2 + Y**2 + 1e-6))
    quiver.set_UVC(U, V)

    # Remove and redraw contour plots
    if plots["contraction"] is not None:
        for coll in plots["contraction"].collections:
            coll.remove()
    if plots["expansion"] is not None:
        for coll in plots["expansion"].collections:
            coll.remove()

    # Redraw contours with fewer levels
    plots["contraction"] = ax.contourf(X, Y, contraction, levels=10, cmap='Blues', alpha=0.6)
    plots["expansion"] = ax.contourf(X, Y, expansion, levels=10, cmap='Reds', alpha=0.6)

    return plots["contraction"].collections + plots["expansion"].collections + [quiver]

# Animate with minimal interval and fewer frames
ani = FuncAnimation(fig, update, frames=np.linspace(0, 1, 50), interval=1, blit=True)
plt.show()
