## About Skimmer

A lightweight, client-side translation class for translating content on a web page.

Skimmer uses key:value pairs to translate content across any number of languages. Dictionaries can be loaded via JSON or JS object fixtures.

## Usage

There are three simple steps to getting up and running with Skimmer.

### Define one or more dictionaries

Dictionaries are stored in JSON-like key/value objects.

    var dictionaries = new Array();
    dictionaries["fr-FR"] = {
        "welcome-text": "Bonjour, comment ça va?",
        "goodbye-text": "Au-revoir et bon journée"
    };

Dictionaries are passed into the Skimmer object as an array (`[lang_1, lang_2, etc...]`)

### Add `data-translation` attributes

Add `data-translation` attributes to the HTML elements you wish to translate to match them with the dictionary entries.

    <p data-translation="welcome-text">Hello, how are you?</p>
    <p data-translation="goodbye-text">Goodbye and have a nice day</p>

### Instantiate a Skimmer object

Call a new instance of the Skimmer class, passing in your dictionary.

    var skimmer = new Skimmer({
        dictionary: dictionaries
    });


From here you can translate any elements with the `data-translation` attribute with the method
    
    skimmer.translate_to_lang("fr-FR");

_(NB: this documentation is currently incomplete, check back soon)_