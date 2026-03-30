# DirectGPT — MLMI16 Extension
### Extended for an MLMI16 study on AI hallucination detection across interface paradigms

This repository is an extension of the original [DirectGPT](https://github.com/damienmasson/DirectGPT) project (CHI'24). It adapts the system to run a controlled study in which participants detect and correct hallucinations in AI-generated summaries, comparing a direct manipulation interface against a standard chat interface.

<img src="demo.gif" height="350">

For details on the original system, see the [accompanying paper](https://arxiv.org/abs/2310.03691).

### [How to build](#how-to-build-and-run) / [Original publication (CHI'24)](#publication)

## How to build and run
The tool was created using TypeScript and React. To run it, you can use npm.
In the project directory, first install all dependencies:
```
npm install
```

Then run the project:
```
npm start
```

Once you started the server, go to this address to access the launcher: http://localhost:3000

## How to use?
After entering your OpenAI API key, you can test DirectGPT using the shortcuts or you can run the study.
Note that the system was tested and developped for recent versions of **Google Chrome** or **Mozilla Firefox**.


## How to get an OpenAI API key?
Because DirectGPT relies on the OpenAI API, you will need a key to make it work. You will need an account properly configured, see [here](https://platform.openai.com/account/api-keys) for more info.
Your key is never stored and the application runs locally and sends requests to the OpenAI API only. To give a rough estimation, running through the whole study is about 20 cents USD and most of the cost comes from the ChatGPT condition.


## Can I try without an API key?
The systen depends on the OpenAI API to work. If you enter an incorrect key, you will still be able to go through the study but executing prompts will yield an error.


## Where are the video tutorials?
From the launcher, you can start the study to see the exact ordering and video tutorials participants went through.
Alternatively, you can go in the ``build/static/tuto`` to review all the video tutorials.


## Publication
> Damien Masson, Sylvain Malacria, Géry Casiez, and Daniel Vogel. 2024. DirectGPT: A Direct Manipulation Interface to Interact with Large Language Models. In Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems (CHI '24) [10.1145/3613904.3642462](https://doi.org/10.1145/3613904.3642462)