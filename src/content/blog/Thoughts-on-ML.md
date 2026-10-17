---
title: "Thoughts on the state of Machine Learning Engineering"
description: "The ML Engineer title went mainstream, but MLOps never quite consolidated. Notes on the tooling sprawl and the platform we built at DPG Media."
pubDate: 2022-10-08
category: "Blog"
tags: ["ML Engineering", "MLOps", "Machine Learning"]
heroImage: "/images/thoughts-on-ml.svg"
---

In 2020 I wrote [this piece](https://medium.com/towards-data-science/how-to-become-a-machine-learning-engineer-in-2020-1161aa29261e) on becoming a ML Engineer. Since then a lot has changed. The job title of ML Engineer is now a relatively common one - a search in October 2022 for Data Scientist and Machine Learning Engineer openings in my home country, the Netherlands, showed the DS:ML ratio to be roughly 6 to 1. Prior to the title of ML Engineer becoming a thing there were obviously plenty of Data Scientists and Software Engineers doing ML Engineering; It simply wasn't called as such. 

Perhaps the tools we used two to three years ago were a little bit more basic, despite already being more numerous than the first five generations of Pokémon put together. We've drifted towards consolidation, though not as much as I had hoped.

Originally I felt that eventually we'd all end up using the tools (e.g. Sagemaker, Vertex) on our cloud vendor of choice with perhaps some companies going for a platform like [W&B](https://wandb.ai/site) or [ClearML](https://clear.ml/). The world of MLOps would be something that was easily surveyed and picking a platform would be a relatively straightforward choice. That hasn't *really* happened. While the large chunks of the simple parts of the MLOps work can be covered by platforms there are still areas where small, manoeuvrable companies are the best. Take for example W&B's experiment tracking and compare it to Sagemaker Experiments. 

There are a lot of these features that you may need something for. Do you need semantic search? A feature store that actually works? Multi-GPU endpoints? An API to receive feedback from prod? A/B tests? An inference serving option that works well with graph neural networks? A way to monitor drift in literally any NLP system? It goes on and on and you're unlikely to find all of these features in the same platform.

For DPG Media, we eventually designed a platform backed on AWS Sagemaker, with some extra tools added for functionality we found lacklustre on AWS. Every new feature we needed outside of Sagemaker meant another tool, and that's how we ended up with AWS Sagemaker with about 7 other applications and platforms. Of course, at the time, there were just two of us, so we wanted to use managed services as often as possible so we could do other stuff as well. But opting for managed tools means less flexibility and (usually) more costs. It's a thin line between engineering and madness. 