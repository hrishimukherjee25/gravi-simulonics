import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# Define a grid
x = np.linspace(-5, 5, 200)
y = np.linspace(-5, 5, 200)
X, Y = np.meshgrid(x, y)

# Warp field dynamics (Contraction and Expansion Zones)
def warp_field(X, Y, t):
    r = np.sqrt(X**2 + Y**2)
    contraction = np.exp(-r**2) * np.cos(2 * np.pi * t)  # Contracting spacetime
    expansion = np.exp(-r**2) * np.sin(2 * np.pi * t)    # Expanding spacetime
    return contraction, expansion

# Initialize figure
fig, ax = plt.subplots(figsize=(6, 6))
ax.set_xlim(-5, 5)
ax.set_ylim(-5, 5)
ax.set_aspect('equal')

# Initialize quiver and plots dictionary
quiver = ax.quiver(X, Y, np.zeros_like(X), np.zeros_like(Y), scale=50)
plots = {
    "contraction": None,
    "expansion": None,
}

# Update function for animation
def update(t):
    # Get contraction and expansion fields
    contraction, expansion = warp_field(X, Y, t)
    
    # Update quiver vectors
    U = contraction * (X / np.sqrt(X**2 + Y**2))
    V = expansion * (Y / np.sqrt(X**2 + Y**2))
    quiver.set_UVC(U, V)
    
    # Remove old contour plots if they exist
    if plots["contraction"] is not None:
        for coll in plots["contraction"].collections:
            coll.remove()
    if plots["expansion"] is not None:
        for coll in plots["expansion"].collections:
            coll.remove()
    
    # Create new contour plots
    plots["contraction"] = ax.contourf(X, Y, contraction, levels=50, cmap='Blues', alpha=0.7)
    plots["expansion"] = ax.contourf(X, Y, expansion, levels=50, cmap='Reds', alpha=0.7)
    
    # Return updated plots and quiver for blitting
    return plots["contraction"].collections + plots["expansion"].collections + [quiver]

# Animate
ani = FuncAnimation(fig, update, frames=np.linspace(0, 1, 100), interval=50, blit=True)
plt.show()
