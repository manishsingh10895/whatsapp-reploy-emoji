from transformers import pipeline
import argparse
import json
import re
import random
import codecs


def get_emotion(text) -> str:
    emotion = pipeline(
        "sentiment-analysis",
        model="j-hartmann/emotion-english-distilroberta-base",
    )

    data = emotion(text)

    maxLabel = ""
    maxScore = 0

    # Get the most effective emotion only
    for i, v in enumerate(data):
        label = v["label"]
        score = v["score"]

        if score > maxScore:
            maxScore = score
            maxLabel = label

    # If no major emotion detected ignore
    if maxScore < 0.5:
        return None

    return maxLabel


def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate emotions")
    parser.add_argument("--text", type=str, help="text to evaluate")

    args = parser.parse_args()

    return args


def process_emojis():
    """Process emoji json file and order required emotions in a dictionary
    with keys as emotion text and emojis in array

    {
        "joy": []
    }

    Returns:
        _type_: _description_
    """
    emotion_emojis = {}

    file = open("emotion-emoji.json")

    data = json.load(file)

    for (emocode, v) in data.items():

        for (emotion, _) in v.items():
            if emotion_emojis.get(emotion) is None:
                emotion_emojis[emotion] = []

        maxScore = 0
        maxLabel = ""

        for (emotion, score) in v.items():
            if emotion == "name" or emotion == "category":
                continue
            score = float(score)
            if score > maxScore:
                maxScore = score
                maxLabel = emotion

        emotion_emojis[maxLabel].append(emocode)

    # make emotions fall in place to emoji.json

    emotion_emojis["joy"] = emotion_emojis["joy"] + emotion_emojis["happiness"]
    emotion_emojis["sadness"] = (
        emotion_emojis["sadness"] + emotion_emojis["disappointment"]
    )

    return emotion_emojis


def run():
    args = parse_args()

    emojis = process_emojis()

    emotion = get_emotion(args.text)

    if emotion is None:
        return

    relevant_emojis = emojis[emotion]

    rel_emoji_unicode = random.choice(relevant_emojis)

    rel_emoji = re.compile(r"U\+").sub(r"\\U000", rel_emoji_unicode)

    # decode unicode string to emoji

    rel_emoji = codecs.unicode_escape_decode(rel_emoji)

    if len(rel_emoji) == 0:
        return

    return_data = json.dumps({"emotion": emotion, "emoji": rel_emoji})[0]

    # print only the json
    # to return to nodejs process
    print(return_data)

    return return_data


run()
