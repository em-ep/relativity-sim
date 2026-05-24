import math
import numpy as np

c = 299792458 # m/s

LIGHTYEAR = 9.461e15 # m

def relativistic_trajectory(distance_ly, acceleration):
    
    d_total = distance_ly * LIGHTYEAR
    d_half = d_total / 2

    tau_half = (
        c / acceleration
    ) * np.arccosh(
        1 + (acceleration * d_half / c**2)
    )

    taus = np.linspace(
        0,
        2 * tau_half,
        500
    )

    earth_times = []
    ship_times = []
    velocities = []
    distances = []

    # this is not elegant. I'm gonna do this differently later
    for tau in taus:

        if tau <= tau_half:

            tau_phase = tau

            x = (
                c**2 / acceleration
            ) * (
                np.cosh(acceleration * tau_phase / c)
                - 1
            )

            t = (
                c / acceleration
            ) * np.sinh(
                acceleration * tau_phase / c
            )

            v = c * np.tanh(
                acceleration * tau_phase / c
            )

        else:
            
            tau_phase = 2 * tau_half - tau

            x_half = d_half

            x_remaining = (
                c**2 / acceleration
            ) * (
                np.cosh(acceleration * tau_phase / c)
                - 1
            )

            x = d_total - x_remaining

            t_half = (
                c / acceleration
            ) * np.sinh(
                acceleration * tau_half / c
            )

            t_remaining = (
                c / acceleration
            ) * np.sinh(
                acceleration * tau_phase / c
            )
    
        earth_times.append(t)
        ship_times.append(tau)
        velocities.append(v)
        distances.append(x)

    return {
        "earth_times": earth_times,
        "ship_times": ship_times,
        "velocities": velocities,
        "distances": distances
    }


def classical_trip_time(distance_ly, acceleration):

    d = distance_ly * LIGHTYEAR

    t = 2 * math.sqrt(d / acceleration)

    return t


def relativistic_trip_time(distance_ly, acceleration):

    d = distance_ly * LIGHTYEAR

    arg = d * (acceleration / c**2) + 1

    t = 2 * (c / acceleration) * math.acosh(arg)

    return t