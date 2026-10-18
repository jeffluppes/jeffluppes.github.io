---
title: "Kiro x Miro Amsterdam Hackathon winner!"
description: "First place at the Kiro x Miro hackathon in Amsterdam with SchoolGuard: a jurisdiction-aware AI tool that helps teachers handle bullying cases."
pubDate: 2026-05-26
category: "Blog"
tags: ["Hackathon", "Kiro", "Agentic AI", "Amsterdam"]
heroImage: "/images/hackathon-winners.jpg"
---

A quick, happy one: together with my partner in crime [Skage](https://www.linkedin.com/in/skage-reistad-10b968263/) I won first place at the **Kiro x Miro hackathon** in Amsterdam with our SchoolGuard project.

![Fist-bumping winners.](/images/hackathon-winners.jpg)

The hackathon meant we had to work with both [Kiro](https://kiro.dev) and Miro. We used Miro to think, pitch a slidedeck mapping out the problem and the flow, and Kiro to build, turning that into a working MVP by the end of the day.

## What we built: SchoolGuard

[SchoolGuard](https://github.com/jeffluppes/kiro-miro-hackathon-2026) is a tool that helps teachers manage bullying cases, with jurisdiction-aware resource discovery as its hero feature. The problem we tried to address: the right way to handle a bullying incident depends heavily on *where* you are. Different municipalities and countries have different anti-bullying policies, legal obligations, and support organizations, and a teacher in the middle of a difficult situation shouldn't have to go hunting for them.

![Slide from the SchoolGuard pitch deck](/images/schoolguard.jpg)

So the demo flow is simple: a teacher enters a school name, an AI agent figures out the jurisdiction and discovers the resources that actually apply there, the teacher reviews and approves what it found, and the system then shows role-specific guidance for handling the case.

A few pieces made it work:

- **Jurisdiction discovery.** An agent (Anthropic Claude with web-search tool-use) performs runtime searches to find municipality-specific policies, legal obligations, and support organizations.
- **Teacher in the loop.** Discovered resources go through teacher approval before entering the knowledge base, so a human vets what the agent surfaces.
- **Role-based routing.** Students, parents, and teachers each see the resources relevant to them.
- **Sensible defaults.** Known Dutch resources (Kindertelefoon, Meldknop.nl, Stichting School &amp; Veiligheid) are always included.
- **Case management.** Jurisdiction-aware checklists and legal guidance for handling incidents.

Under the hood it's a React + Vite + TypeScript frontend, a Node.js + Express backend with Zod validation, SQLite for storage, and the Claude agent doing the discovery. It's all on [GitHub](https://github.com/jeffluppes/kiro-miro-hackathon-2026) if you want to poke around.

I don't want to get overly poetic but a hackathon lives or dies with the energy of the people around you, and this one was full of sharp, friendly builders who were there for the same reason: to make something, learn a bit, and have fun doing it.

![The whole group at the end of the day.](/images/miro-kiro-hackathon-group.jpg)

Thanks to the organizers at Miro and the Kiro team for putting it on, and to everyone who participated. Days like this are a reminder of why I got into this field in the first place. My role tends to be slightly more platform and ML than AI, so this was a great day to get outside and pick up some new AI ideas and fresh energy.

Now, back to production.
