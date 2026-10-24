import math


def calculate_metrics(errors, actual_values):
    count = len(errors)

    if count == 0:
        return {
            "mae": 0.0,
            "bias": 0.0,
            "rmse": 0.0,
            "mape": 0.0,
            "comparedDataPoints": 0,
            "errorBandMw": 0.0,
        }

    abs_errors = [abs(error) for error in errors]
    mae = sum(abs_errors) / count
    bias = sum(errors) / count
    rmse = math.sqrt(sum(error * error for error in errors) / count)

    mape_terms = [
        abs(error) / abs(actual) * 100
        for error, actual in zip(errors, actual_values)
        if actual not in (0, None) and abs(actual) > 0
    ]
    mape = sum(mape_terms) / len(mape_terms) if mape_terms else 0.0

    return {
        "mae": round(mae, 2),
        "bias": round(bias, 2),
        "rmse": round(rmse, 2),
        "mape": round(mape, 2),
        "comparedDataPoints": count,
        "errorBandMw": round(mae, 2),
    }
