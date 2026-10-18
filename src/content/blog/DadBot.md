---
title: "Hackathon project: DadBot, an AI assistant to slay the dad bod (10000 AIdeas submission)"
description: "DadBot is an agentic AI health coach built almost entirely serverless on AWS Bedrock, with personalized ML models, for about three dollars a month. Here's how I built it."
pubDate: 2026-03-10
updatedDate: 2026-03-23
category: "Projects"
tags: ["Agentic AI", "AWS", "Bedrock", "Serverless", "Kiro", "Terraform"]
heroImage: "/images/dadbot-header.webp"
---

> Note: this article was written for the AWS 10,000 AIdeas hackathon. My project DadBot ended up in the semi-finals, ending around position 100 (out of 10k!) but did not end up being selected by the AWS panel for the finals. Dadbot features personalized machine learning models and self-adjusting lifestyle agentic coaching powered by AWS Bedrock, and it's almost completely serverless.

![DadBot: personalized lifestyle coaching.](/images/dadbot-header.webp)

## My vision

Calorie tracking, fitness, and lifestyle coaching apps all require the user to continuously log information, often by hand. Hardly any offer a natural-language (free text) interface, most aren't pro-active about reminders, and few offer any meaningful personalization. In my vision, that should change.

Most lifestyle-change methods are one-size-fits-all, while humans certainly aren't. In practice people tend to try several things before finding what works for them. In my ideal world we'd all have a pocket health coach that can fall back on personalized recommendation and prediction algorithms to figure out what works best and how our progress is likely to go over time. People are often more than willing to change their lives to lose (or gain) weight, but aren't coached in the right way. I want as few barriers as possible standing in the way.

So I built DadBot, the agentic AI health coach. DadBot talks to users on apps they already use, like WhatsApp, Signal, Telegram, or Discord. It gets in touch several times a day to brief them on how the day looks and suggests a workout based on things like the weather, the user's calendar, their workout preferences, and their recent history. Users can log workouts, weight stats, meals, and update their profile just by chatting.

The name is a playful nod to "dad bod", the informal term for the stomach fat often accumulated after becoming a dad.

## Why this matters

In most of the western world, body weight is increasingly a problem. In my own country, the Netherlands, about 50.4% of the population is now overweight (2024 data). Many of those people aren't yet in sight of traditional healthcare providers, and don't want to be. A low-fuss, low-threshold way to follow a personalized routine would be an ideal way to coach them.

Personalized coaching exists and is lucrative: a personal trainer can easily charge near 100 dollars an hour. But giving half the population a personal trainer doesn't scale. My method can help people who don't want to spend that money, or who have anxiety about seeking help, at a fraction of the cost.

On a personal note: the inspiration comes from my own experience trying to lose weight after becoming a dad. I found it hard to change my routine with a full-time job, all the dad things, and keeping up with the general craziness of the world. I figured I could use a fitness coach, but quickly found they tend to operate during business hours, which is exactly when I'm working. Asking around my friend circle, this was a common theme. A lot of us can only get a workout in when the kids are asleep or away. Right now I'm using DadBot myself, eating my own dog food, and it has been surprisingly spot-on.

## How I built this

I had the idea in my head, but translating it to code was hard, even with AI. I spent a couple of hours whiteboarding the features I wanted and turned that into an architecture diagram. The key pieces:

- **[AWS Lambda](https://aws.amazon.com/lambda/)** for serverless compute, since this app doesn't need to run permanently: one Lambda behind the API Gateway for auth, another for agent tools and chats, and one to cheaply host a small regression ML model. (Yes, we're combining AI with old-school ML. More on that later.)
- **[API Gateway](https://aws.amazon.com/api-gateway/)** to provide an API I can talk to.
- **[Bedrock](https://aws.amazon.com/bedrock/) / [Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/)** for the agentic AI calls.
- **[DynamoDB](https://aws.amazon.com/dynamodb/)** for logging.
- **[SNS](https://aws.amazon.com/sns/)** for email and text, and to connect to third-party apps and Discord.
- **[EventBridge Scheduler](https://aws.amazon.com/eventbridge/scheduler/)** to send reminders and check in during the day.
- **[Secrets Manager](https://aws.amazon.com/secrets-manager/)** for API keys and tokens.
- **[Terraform](https://www.terraform.io/)** for infra as code, so the whole app is easy to redeploy and recover.
- **[CloudWatch](https://aws.amazon.com/cloudwatch/)** for logs, metrics, and dashboards.
- **[Python](https://www.python.org/)** for almost all the backend, with **[uv](https://docs.astral.sh/uv/)** as the package manager.

Since using **[Kiro](https://kiro.dev)** was a required part of the competition, I converted my ideas into bite-size user stories and prompted away. I was surprised that when I presented Kiro with my idea and some context, it generated about 25 user requirements that already aligned pretty well. Throughout the project I used the "Deploy Infrastructure with Terraform" Kiro Power. It was nice having a pocket Product Owner, and some back-and-forth yielded almost exactly the features I had in mind. Kiro made it easy to move from Requirements to Design (architecture and data models) to Tasks (bite-sized coding units), and came up with an 1100-line design document.

I then used it to generate the code, starting with infra and tests so I could check the functionality. I was pretty skeptical throughout, and probably burned more credits than needed going back and forth on minor refactors. There were small errors to catch: circular dependencies in the infra code, minor hallucinations in Python (arguments not supported by a given framework version), and the occasional command that didn't match my operating system.

The first version I could actually deploy took about 110 Kiro credits and 3 hours. Getting to something I felt comfortable deploying took two weeks and 913 credits. I reviewed most of the code, but the initial version still came to 45,000 lines of Python and Terraform. There was a lot of debugging as the system grew, particularly the AI infra. I found it easier to use AI to get a working version, then take a step back and refactor toward something more optimal.

![The DadBot architecture: Lambdas behind an API Gateway, an Amazon Bedrock agent with tools, DynamoDB for storage, EventBridge for scheduled check-ins, and SNS for notification channels.](/images/dadbot-architecture-diagram.webp)

Capturing everything as infra-as-code paid off. Deploying is ridiculously smooth once `terraform validate` and `terraform plan` pass: 161 pieces of infra, deployed with `terraform apply` in about 1 minute 40 seconds, using a least-privilege role rather than root credentials.

![Terraform plan: 161 to add.](/images/dadbot-terraform-plan.webp)

![Terraform apply complete: 161 resources added.](/images/dadbot-terraform-apply.webp)

That's a lot of infra, and most of it stems from supporting multiple chat channels and integrating multiple APIs. Integration added tremendously to the complexity. I found it easier to generate small test scripts and Jupyter notebooks to check functions, since AI coding agents have no problem telling you something works to your face while it fails over and over. With current models you still need to be on top of things, though it's becoming much more doable.

## Design decisions worth highlighting

- **The agent has tools.** The coach can call tools for weather (to suggest activities), logging food, logging activities, logging progress, calorie estimation, managing preferences, activity history, calendar, profile, and a weight-loss prediction (an ML model, below).
- **A more powerful model to drive the tools.** Some models I tried had trouble picking the right tool, so I switched to Claude Haiku 4.5. More expensive, but more capable.
- **An ML model hosted inside a Lambda.** I host a simple regression model in a Lambda to estimate how calorie intake translates to gains or losses. I'd probably have preferred [SageMaker](https://aws.amazon.com/sagemaker/) for the lifecycle tooling, but a Lambda works and is significantly cheaper.
- **A fallback for the cold-start problem with new users.** I want a personalized model per user (which can be a few kilobytes), but those need a bit of data we don't have on day one. So the fallback simply assumes 7700 calories convert to 1 kg of body weight.
- **Cache as much as possible.** For weather I use [OpenWeatherMap](https://openweathermap.org/api), which limits daily calls, so I fetch once and serve from the DynamoDB cache for the rest of the day.
- **One-way via SNS, two-way via the API Gateway.** I settled on Discord as the main channel because it has few limits; other channels are one-way for now.
- **Not going live to the public (yet).** I'm in the EU, so there are pervasive data-protection requirements (a register of processing, an end-user agreement, transparency on data use), and a health coach likely falls under the High-Risk category of the [EU AI Act](https://artificialintelligenceact.eu/). I'd probably have to register a business too. So I've kept the app private for now.
- **Ready for production anyway.** Even unreleased, it's set up with separate dev/stage/prod environments through IaC, so I can pack it up and deploy to another account.
- **Not relying on LLMs for calorie accuracy.** You can send an LLM a picture of almost anything and it describes it in detail, but asking it to estimate calories from an image tends to be way off. In a controlled test of five food items, estimates were about 60% off even though the model correctly identified the food. My plan is to have the agent describe the food, then look it up in a database (possibly via [RAG](https://aws.amazon.com/what-is/retrieval-augmented-generation/)) for a more accurate estimate.

## The stack

| Service | Count | Purpose |
| --- | --- | --- |
| Amazon Bedrock | 1 agent | AI fitness coach on Claude Haiku 4.5, 2 action groups, 12+ tools |
| AWS Lambda | 10+ | Serverless compute for all backend logic |
| DynamoDB | 8 tables | NoSQL storage, on-demand |
| API Gateway | 1 REST API | HTTP endpoints for client access |
| EventBridge | 3 rules | Scheduled check-ins (breakfast, lunch, evening) |
| SNS | 1 topic | Multi-channel notifications |
| Secrets Manager | 3 secrets | API keys and tokens |
| CloudWatch | 10 log groups | Application logs and dashboards |
| IAM | 12 roles + policies | Least-privilege access control |

## Demo

Most of the core features are live. DadBot checks in several times a day with customized, highly motivational messages. In the morning it looks up the weather, my preferences, and my schedule to suggest something:

![Morning check-in: DadBot recommends an activity based on the weather, schedule, and preferences (kayaking).](/images/dadbot-checkin-morning.webp)

And in the evening, if I haven't logged anything yet, it nudges again based on the current conditions:

![Evening check-in: DadBot suggests a run or a cycle ride.](/images/dadbot-checkin-evening.webp)

When asked, it offers recommendations with context, like following up on a bike ride I just logged in Amsterdam:

![Recommendation with context: suggestions after a logged bike ride.](/images/dadbot-recommendation.webp)

It picks up missing profile details on its own, without being explicitly coded to:

![DadBot notices the user's location and preferences aren't set, and asks for them.](/images/dadbot-profile-prompt.webp)

And it connects to [Strava](https://www.strava.com/), spotting activities I logged there and cheering me on:

![DadBot finds a Strava activity and gives feedback.](/images/dadbot-strava.webp)

## The web app

What's the point of a nice backend without an app for it? The web app is Next.js 14 + TypeScript, with Tailwind, React Markdown for the chat, and Recharts for the dashboards. It lets a user log in, check weekly stats, see an activity streak, manage their profile (with a light/dark switch), connect Strava/Discord, and even rename DadBot. I added it because while the agent handles profile management fine, I often just want to verify it's correct without a trip to DynamoDB.

![The DadBot landing page.](/images/dadbot-landing.webp)

![The dashboard: weight, calories, activity, and goal progress.](/images/dadbot-dashboard.webp)

![The goals page, with streaks and weight targets.](/images/dadbot-goals.webp)

![Chatting with DadBot in the web app.](/images/dadbot-webapp-chat.webp)

## Cost estimate

Running almost entirely serverless, this is absurdly cheap:

- AWS Lambda: within free tier
- Bedrock (agentic AI): ~$1.56/month
- Secrets Manager: ~$1.21/month
- DynamoDB, API Gateway, EventBridge, SNS: within free tier
- CloudWatch: ~2 cents

**Total with free tier: $2.79/month, about 9 cents a day.** Most of that is Bedrock, so the cost per user works out to roughly 5 cents a day. Without the free tier it'd be about $3.86 a month. Still insanely cheap. Hosting the web app on S3 + CloudFront would add about $1.40/month, so for now I run it locally to save cost and shrink my security footprint.

## What I learned

- **API Gateway makes rolling out APIs easy.** I'd spent hours on API Gateway and routing years ago and never really understood it. Diving in on this project made me realize it's much easier than I remembered.
- **Using AI to code at large scope is a different muscle.** At work I code with AI like a precision knife: small changes, verify, repeat. With Kiro my scope was the entire project, and I made far larger rewrites than I would with production code.
- **Integrating external APIs is hard.** I'd planned many more integrations and had to scale back my ambitions to fit the time I had.
- **It's genuinely cheap.** It's mostly serverless, so I can tear the infrastructure down whenever I'm not using it. Costs scale linearly with users.
- **AI-generated code is bigger, and harder to review and maintain.** LLMs produce code quite different from what human developers write, and the codebase was much larger than something I'd have written by hand. Without good steering, Kiro would drift and undermine an approach it had set up a short while earlier. One of the legends of software engineering said a code base's greatest property is how maintainable it is. Keeping LLM-generated code maintainable takes a lot of back-and-forth and review, and that's where approaching it from a software-engineering angle is a useful skill in the age of AI.

## Future work

If I were to make this a proper product:

- Figure out what I need in place to comply with local data-protection laws, since I'm storing highly personal health data.
- Launch for more users than just me, without going bankrupt on LLM calls.
- More personalized dashboards for data-savvy users.
- Collaborate with food databases (the Dutch [Levensmiddelendatabank](https://www.rivm.nl/nederlands-voedingsstoffenbestand), the UK's [CoFID](https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid), the [USDA FoodData](https://fdc.nal.usda.gov/)) to greatly improve calorie prediction. Only the USDA set appears to permit commercial use.
- Fix cold starts: with Discord I have to acknowledge a message within 3 seconds, so I reply "Thinking..." immediately and edit the message once Bedrock responds. I also want to move away from slash commands toward a more natural conversation flow.

Thanks for reading. Despite leaning on AI for much of the project, the text of this post and the drawings (aside from the header and the Kiro screenshots) were made by hand, not generative AI. The architecture diagram was drawn in [Excalidraw](https://excalidraw.com/).
