import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# Define a grid for the simulation
x = np.linspace(-5, 5, 200)
y = np.linspace(-5, 5, 200)
X, Y = np.meshgrid(x, y)

# Warp field dynamics (Contraction and Expansion Zones with refinements)
def warp_field_realistic(X, Y, t):
    r = np.sqrt(X**2 + Y**2)
    
    # Energy dissipation over time
    energy_dissipation = np.exp(-0.1 * t)
    
    # Random noise to simulate instability
    noise = np.random.normal(0, 0.1, X.shape)
    
    # Gravitational wave perturbation
    gravity_wave = 0.1 * np.sin(4 * np.pi * t)
    
    # Contraction and expansion with all refinements
    contraction = energy_dissipation * np.exp(-r**2) * (np.cos(2 * np.pi * t) + gravity_wave + noise)
    expansion = energy_dissipation * np.exp(-r**2) * (np.sin(2 * np.pi * t) + gravity_wave + noise)
    return contraction, expansion

# Initialize the figure
fig, ax = plt.subplots(figsize=(8, 8))
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
    contraction, expansion = warp_field_realistic(X, Y, t)
    
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

# Animate the simulation
ani = FuncAnimation(fig, update, frames=np.linspace(0, 5, 200), interval=50, blit=True)

# Display the simulation
plt.show()
