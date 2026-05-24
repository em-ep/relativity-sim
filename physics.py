import math

c = 299792458 # m/s

LIGHTYEAR = 9.461e15 # m


def classical_trip_time(distance_ly, acceleration):

    d = distance_ly * LIGHTYEAR

    t = 2 * math.sqrt(d / acceleration)

    return t


def relativistic_trip_time(distance_ly, acceleration):

    d = distance_ly * LIGHTYEAR

    arg = d * (acceleration / c**2) + 1

    t = 2 * (c / acceleration) * math.acosh(arg)

    return t