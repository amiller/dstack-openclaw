"""
Tests for Python example skill
"""

from skill import reverse_string, count_vowels

def test_reverse_string():
    assert reverse_string("hello") == "olleh", "Failed to reverse 'hello'"
    assert reverse_string("") == "", "Failed to reverse empty string"
    assert reverse_string("a") == "a", "Failed to reverse single char"
    print("✓ reverse_string() tests passed")

def test_count_vowels():
    assert count_vowels("hello") == 2, "Failed to count vowels in 'hello'"
    assert count_vowels("AEIOU") == 5, "Failed to count uppercase vowels"
    assert count_vowels("xyz") == 0, "Failed with no vowels"
    print("✓ count_vowels() tests passed")

if __name__ == "__main__":
    print("Running Python skill tests...")
    test_reverse_string()
    test_count_vowels()
    print("\nAll tests passed! ✓")
