from datetime import datetime, date

def validate_january_date(date_str):
    """
    Custom validation helper: ensures the date is formatted correctly 
    and falls strictly within January 2026.
    """
    try:
        parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return None, "Invalid date format. Use YYYY-MM-DD."
    
    start_limit = date(2026, 1, 1)
    end_limit = date(2026, 1, 31)
    
    if not (start_limit <= parsed_date <= end_limit):
        return None, "Date must be between January 1, 2026 and January 31, 2026."
        
    return parsed_date, None