---
title: "Who reviews the robot? On maintaining AI-generated code"
description: "AI can write a working system in an afternoon. Keeping that system maintainable is a different job, and it's increasingly the one that matters."
pubDate: 2026-01-18
category: "Blog"
tags: ["AI", "Software Engineering", "ML Engineering", "Agentic AI"]
heroImage: "/images/architect-AI.jpg"
---

A while back I built a side project with an AI coding agent and watched it produce around 45,000 lines of Python and Terraform in a couple of weeks. It worked. It deployed. It did roughly what I asked. And it became painfully obvious that I could generate this much faster than I could ever read it. I felt that trying to keep up, *at scale* is a fast track towards a burn out.

The massive gap between how fast we can produce code and how fast we can understand it, is the thing I keep coming back to. It isn't new. We've had code generators, scaffolding tools, and copy-paste from the internet for decades. Twelve years ago we were already comfortable generating APIs from specs like Swagger (OpenAPI). What's new is the scale and the confidence. An agent will cheerfully write a thousand lines, tell you it works, and be wrong in a way that looks completely plausible.



## Working is the easy part

There's a comforting illusion that if the tests pass and the thing deploys, the work is done. For a demo, sure. For a hackathon, absolutely, ship it. But most software isn't a demo. Most software is a thing that has to keep working next quarter, when the requirements have shifted, a dependency has a CVE, and the person debugging it at 2am has never seen the code before.

The famous line is that code is read far more often than it's written. AI changes the ratio, not the rule. If anything it makes reading *more* important, because now the writing is nearly free and the reading is the only place careful thought still has to happen.

## Two modes of coding with AI

I've noticed I work in two completely different modes depending on the stakes.

At work, on production systems with sometimes a fair bit of professional history (AKA legacy code - I also like the term "organically grown code base" more and more these days), I use AI like a precision knife. Scoped changes, verify each step, keep the diff reviewable. I have a professional anxiety about large AI-driven refactors on code that real users depend on, and I think that anxiety is healthy. The blast radius is real. There are also compliance and security factors at play.

On side projects, I vibe away and let the scope be the whole project. I'll ask for sweeping rewrites I'd never request on production code, because the cost of being wrong is my own evening, not a customer's trust. That freedom is genuinely fun, and it's where you learn what these tools can actually do at the limit.

## Where agents drift

The failure mode I see most isn't dramatic hallucination. It's drift. You set up a clean approach, an agent follows it for a while, and then a few prompts later it quietly undermines the very structure it just built: a second way to do the same thing, a helper that duplicates an existing one, a pattern abandoned halfway. Each individual step looks reasonable. The sum is a codebase with no coherent point of view. At the time of writing its still very easy to pigeonhole a LLMs session where it gets stuck trying the same thing over and over and its very easy to generate legacy code in a short amount of time.

Human teams drift too but we have significantly different problems processing information and context, which is why we have design docs, code review, and architecture decisions written down. An agent can out-produce your ability to notice the drift unless you deliberately slow it down and keep re-asserting the shape you want.

## What actually helps

A few things I've found that keep AI-generated code from rotting:

- **Make it explain the plan before it writes.** Requirements, then design, then tasks. If the plan is wrong, you catch it for the price of a paragraph instead of a thousand lines. Copilot, Cursor, Kiro all have something for it.
- **Keep diffs small enough to actually read.** If you can't review it, you don't own it, you're just hoping. "Looks fine" is not review. 
- **Refactor on purpose, by hand or with a tight leash.** I often use AI to get a working version fast, then step back and restructure toward something I'd be happy to maintain. The first draft is scaffolding, not the building. As a ML engineer, this is like making a hotfix in prod and putting it in a PR later that week. Same principles apply here.
- **Treat generated code as a draft from a very fast, very junior colleague.** Enthusiastic, tireless, occasionally brilliant, and in need of a senior who reads everything before it ships.

## The skill that's going up in value

Here's the part I find oddly reassuring. As generation gets cheaper, the premium shifts to judgment: knowing what good structure looks like, spotting when something is subtly wrong, deciding what to keep and what to throw away. That's software engineering, the discipline, as opposed to typing, the activity. 

![Everyone's an architect now, whether they asked for the promotion or not.](/images/architect-AI.jpg)

I don't think AI makes engineers obsolete. I think it quietly promotes all of us into leads and architects whether we asked for the "promotion" or not. The people who thrive will be the ones who were already good at the unglamorous parts: naming things well, keeping systems simple, saying no to complexity, caring whether the next person can understand what they left behind.

The robot can write the code. Someone still has to be responsible for it. For now, at least, that someone is us.
