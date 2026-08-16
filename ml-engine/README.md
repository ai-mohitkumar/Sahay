# ML Engine & Heuristic Intelligence

This directory contains the analytical models powering Sahay's unique intelligence layer:

1. **`readiness_calculator.py`**:
   - Calculates dynamic subject and composite exam readiness ($R \in [0, 100\%]$).
   - Incorporates Ebbinghaus memory decay for topics without recent practice.

2. **`burnout_risk.py`**:
   - Predicts cognitive fatigue, sleep deficit penalties, and recovery requirements ($B \in [0.0, 1.0]$).

3. **`tradeoff_heuristics.py`**:
   - Algorithmic counterpart generation for negotiation dialogs.
