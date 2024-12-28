import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

# Define grid for spacetime
x = np.linspace(-5, 5, 100)
y = np.linspace(-5, 5, 100)
X, Y = np.meshgrid(x, y)

# Unified field components
def unified_field(X, Y, t):
    r = np.sqrt(X**2 + Y**2)
    gravity = np.exp(-r**2) * np.sin(2 * np.pi * t)  # Gravity as a symbolic wave
    electromagnetism = np.exp(-r**2) * np.cos(2 * np.pi * t)  # Electromagnetism as a field
    strong_force = np.exp(-r**2) * np.sin(4 * np.pi * t)  # Strong force at higher frequency
    weak_force = np.exp(-r**2) * np.cos(4 * np.pi * t)  # Weak force at higher frequency
    return gravity + electromagnetism + strong_force + weak_force

# Initialize figure
fig, ax = plt.subplots(figsize=(6, 6))
ax.set_xlim(-5, 5)
ax.set_ylim(-5, 5)
ax.set_aspect('equal')

# Initialize quiver plot
quiver = ax.quiver(X, Y, np.zeros_like(X), np.zeros_like(Y), scale=50)

# Update function for animation
def update(t):
    field = unified_field(X, Y, t)
    U = field * (X / np.sqrt(X**2 + Y**2 + 1e-6))  # Avoid division by zero
    V = field * (Y / np.sqrt(X**2 + Y**2 + 1e-6))
    quiver.set_UVC(U, V)
    return quiver,

# Animate
ani = FuncAnimation(fig, update, frames=np.linspace(0, 1, 100), interval=20, blit=True)
plt.show()
