---
title: "The class of 2015 - An analysis in what jobs the people I graduated with ended up"
description: "I collected the job titles of the people I started my Computer Science degree with, to see where a cohort actually lands years later."
pubDate: 2020-03-25
category: "Projects"
tags: ["LinkedIn", "Web Scraping", "Python", "Data Analysis"]
heroImage: "/images/students.png"
---

Computer Science degrees are notorious for their attrition rate and a lot of people switch degrees. I've switched twice myself, going from CS to AI and then to Software Engineering. Due to the way the Dutch system is organized this almost meant starting from scratch. Frankly, not my best decisions. But I was young.

 I figured that it could be interesting to look what everyone was doing now. Most people generally do find their way to the finish line and there is also a substantial part that starts working and doesnt finish their degree. Interestingly, the Hanze University of Applied Science [had the same idea](https://www.itacademy.nl/kennisbank/factsheets/factsheet) and scraped linkedIn profiles of all their alumni - assumingly me included. They found that the top 3 roles for software engineers were:

* Developer
* Software Engineer
* Consultant

I decided to do the same, but the motivation for me is a little different than the Hanze. For GDPR reasons the Hanze can claim their possession of this data is justified: after all, they should know where their graduates end up so they can adjust their curriculum every few decades. I also did not need to redo their work and classify the size of the company someone worked at or the location (North or Randstad et cetera..)

## Wait, where's that attendance list?
I still had a grades list from the end of year 1 at which point there were 100 students left. Having made it through the first year, most would go on and graduate. Since scraping is a bit out of the question here, I decided to hit up their linkedin myself (and often saying hi or sending a friend request). I'd only collect their job title from Linkedin, which I added to a CSV.

Sure enough, out of **103** students, there were **78** I could find on LinkedIn. I saw happy faces and a lot of heavy metal shirts. Some people had left IT altogether. Some were doing a master's degree. Some had started a company abroad. It seems that the people I could not find had might've done so to minimize their footprint online, especially not uncommon when one goes into security.

At this point I did some limited post-processing on this list. I removed terms such as medior or senior (side note: hardly anyone was a junior) and tried to merge the various security, consultancy, and dev-related roles together towards a standardized format. Application Developer became Software Developer, but .NET developers and embedded systems developers kept their title. This is a bit arbitrary and opens up this little adventure to bias.

I removed eight non-IT roles, such as caretaker, military, nurse and store manager. For double roles I tried figuring out which was more reasonable. For instance if someone had founded a succesful company but still listed themselves as an developer, I figured that the Founder role was more defining.

## Findings
Little to no surprise was that the top three is pretty much the same still the same. The full list is below, but here are some things that stood out to me:

* Only two people started a company
* There are no data scientists
* Likewise, there are no software engineers in BI roles.
* Two people are currently doing an internship - most likely as a part of a MSc degree requirement.
* There is exactly one Software Architect
* In the same vein of requiring experience, there are a handful of managers, but mostly related to products and not teams.
* There are several cloud engineers. Back in 2015, this role was pretty much unheard of.
* Yours truly is the only Machine Learning Engineer to make the sample.

My curiousity is now satisfied, but not before I made a word cloud of this collection.

![Word cloud](/images/students.png)


| Job title          |     Count (n=70)|
|-----------------------------|---------|
| Software Developer          |     13 |
| Software Engineer           |      10 |
| Consultant                  |       6 |
| .NET Developer              |       3 |
| Cloud Engineer              |       3 |
| Full-stack Developer        |       3 |
| Project Manager             |       2 |
| Product Owner               |       2 |
| Founder                     |       2 |
| Security Consultant         |       2 |
| Network Engineer            |       2 |
| Intern                      |       2 |
| Back-end Developer          |       2 |
| Account Manager             |       2 |
| Service Manager             |       1 |
| Solution Developer          |       1 |
| Embedded Software Engineer  |       1 |
| Functional Application Manager  |   1 |
| Mobile Developer           |        1 |
| Systems Engineer           |        1 |
| Front-end Developer        |        1 |
| Machine Learning Engineer  |        1 |
| Scrum Master               |        1 |
| Web Developer              |        1 |
| Field Engineer             |        1 |
| Change Manager             |        1 |
| Solution Experience Manager|        1 |
| Software Architect         |        1 |
| DBA                        |        1 |
| Sysadmin                   |        1 |

![Roles](/images/student_roles.png)
