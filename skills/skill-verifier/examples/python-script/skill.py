"""
Example Python skill - string utilities
"""

def reverse_string(s):
    """Reverse a string"""
    return s[::-1]

def count_vowels(s):
    """Count vowels in a string"""
    vowels = 'aeiouAEIOU'
    return sum(1 for char in s if char in vowels)

if __name__ == "__main__":
    # Demo
    print("String utilities skill")
    print(f"Reverse 'hello': {reverse_string('hello')}")
    print(f"Vowels in 'example': {count_vowels('example')}")
