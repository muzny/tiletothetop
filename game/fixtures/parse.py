#!/usr/bin/python


def main():
    lines = open("data.txt").readlines()
    json = open("initial_data.json", "w")
    json.write("[\n")
    pk = 1
    data = []
    for line in lines:
        datum = ""
        datum += "\t{\n"

        datum += ('\t\t"model": "game.Word",\n')
        datum += ('\t\t"pk": %d,\n' % pk )
        datum += ('\t\t"fields": {\n')

        parts = line.split("--")
        word = parts[0].strip()
        second = parts[1].split()
        speech = list(second[0])
        speech = "".join(speech[1:-1])
        defn = " ".join(second[1:])

        datum += ('\t\t\t"word": "%s",\n' % word)
        datum += ('\t\t\t"definition": "%s",\n' % defn)
        datum += ('\t\t\t"part_of_speech": "%s"\n' % speech)
        datum += ("\t\t}\n")
        datum += ("\t}")
        pk += 1
        data.append(datum)

    json.write(',\n'.join(data))
    json.write("\n]\n")

if __name__ == "__main__":
    main()

