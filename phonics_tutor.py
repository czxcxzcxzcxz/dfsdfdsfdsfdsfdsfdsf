#!/usr/bin/env python3
"""Step-by-step systematic synthetic phonics tutor."""

from __future__ import annotations

import random
from dataclasses import dataclass


@dataclass(frozen=True)
class LessonStep:
    name: str
    graphemes: tuple[str, ...]
    words: tuple[str, ...]
    sentence: str


LESSON_STEPS: tuple[LessonStep, ...] = (
    LessonStep(
        name="Step 1: s, a, t, p, i, n",
        graphemes=("s", "a", "t", "p", "i", "n"),
        words=("sat", "pin", "tap", "pat", "tin", "sip"),
        sentence="A tin pan sat.",
    ),
    LessonStep(
        name="Step 2: m, d, g, o, c, k",
        graphemes=("m", "d", "g", "o", "c", "k"),
        words=("dog", "cat", "dig", "sock", "kid", "mask"),
        sentence="A cat digs in mud.",
    ),
    LessonStep(
        name="Step 3: ck, e, u, r, h, b, f, ff, l, ll, ss",
        graphemes=("ck", "e", "u", "r", "h", "b", "f", "ff", "l", "ll", "ss"),
        words=("duck", "bell", "huff", "red", "rub", "hill"),
        sentence="The duck fell in a red tub.",
    ),
    LessonStep(
        name="Step 4: j, v, w, x, y, z, zz, qu, ch, sh, th, ng",
        graphemes=("j", "v", "w", "x", "y", "z", "zz", "qu", "ch", "sh", "th", "ng"),
        words=("ship", "that", "quiz", "buzz", "wing", "chop"),
        sentence="The fish can buzz and sing.",
    ),
)


def explain_step(step: LessonStep, index: int) -> None:
    print("\n" + "=" * 70)
    print(f"{step.name}")
    print("=" * 70)
    print("New graphemes:", ", ".join(step.graphemes))
    print("Read and blend these words:", ", ".join(step.words))
    print("Sentence practice:", step.sentence)
    print("Writing tip: Say each sound slowly and write one grapheme per sound.")
    print(f"Progress: {index + 1}/{len(LESSON_STEPS)} steps complete after this lesson.")


def phoneme_prompt(word: str) -> str:
    return "-".join(word)


def run_reading_check(step: LessonStep) -> int:
    print("\nReading check: Type each word exactly as you blend it.")
    score = 0
    for word in random.sample(step.words, k=min(4, len(step.words))):
        clue = phoneme_prompt(word)
        answer = input(f"Blend this: {clue} -> ").strip().lower()
        if answer == word:
            print("✅ Correct")
            score += 1
        else:
            print(f"❌ Nice try. Correct answer: {word}")
    return score


def run_spelling_check(step: LessonStep) -> int:
    print("\nWriting check: Type the word you hear in your head.")
    print("Tip: cover the screen, say the sounds, then write.")
    score = 0
    for word in random.sample(step.words, k=min(4, len(step.words))):
        input(f"Spell this word: '{word}' (press Enter when ready to type) ")
        answer = input("Your spelling: ").strip().lower()
        if answer == word:
            print("✅ Correct")
            score += 1
        else:
            print(f"❌ Good attempt. Correct spelling: {word}")
    return score


def step_loop(step: LessonStep, index: int) -> bool:
    explain_step(step, index)
    reading_score = run_reading_check(step)
    spelling_score = run_spelling_check(step)
    total = reading_score + spelling_score
    print(f"\nStep score: {total}/8")

    if total >= 6:
        print("Great work! You are ready for the next step.")
        return True

    print("Let's repeat this step once more before moving on.")
    return False


def main() -> None:
    random.seed()
    print("Systematic Synthetic Phonics Tutor")
    print("Goal: Learn to read and write by introducing sounds in a planned sequence.")

    step_index = 0
    while step_index < len(LESSON_STEPS):
        passed = step_loop(LESSON_STEPS[step_index], step_index)
        if passed:
            step_index += 1

    print("\n🎉 Course complete!")
    print("Next challenge: read decodable books using these grapheme sets.")


if __name__ == "__main__":
    main()
