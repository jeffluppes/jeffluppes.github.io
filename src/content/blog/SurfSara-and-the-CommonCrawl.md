---
title: "Big Data Series - SurfSara and the Common Crawl"
description: "A free-format project on the SurfSara Hathi cluster: running Spark over 1.73 billion crawled web pages to build word clouds around kayaking."
pubDate: 2017-07-07
category: "Academics"
tags: ["University", "Spark", "Hadoop", "SurfSara", "Common Crawl"]
heroImage: "/images/surfsara-wordcloud-fullcrawl.png"
---

![I wish I learned Hadoop while still in diapers..](/images/surfsara-meme.jpg)

This post will have a slightly different angle than the previous posts in the Big Data Course series. The goal for this post is just to detail my progress on a self-chosen, free format project which utilizes the [Surfsara Hadoop cluster](https://userinfo.surfsara.nl/systems/hadoop/hathi) and the goal is not to solve a problem but rather give an overview of the problems I encountered and the little things I came up with. I intend to post these both on the mini-site for the course and a personal blog, my apologies if my tone is a bit bland as a result. Here we go!

## Hathi and Surfsara
[SurfSara](https://www.surf.nl/en/about-surf/subsidiaries/surfsara/) is a Dutch institute that provides web and data services to universities and schools. Students may know SURF from the cheap software or the internet they provide to high schools. [Sara, though](https://nl.wikipedia.org/wiki/SURFsara_Nationaal_HPC_Centrum) is the high performance computing department, and used to be the academic center for computing prior to merging into SURF. They do a lot of cool things with big data which over time has come to include a Hadoop cluster named Hathi. 

## The Common Crawl
The Hathi cluster hosts a February 2016 collection from the Common Crawl. The Common Crawl is a collection of crawled web pages which comes pretty close to crawling the entirety of the web. The data hosted is in the petabyte range, however we only have access to a single snapshot.. which still takes up a good amount of terabytes and contains 1.73 billion urls. You don't want to download this on your mobile phone's data cap. 

The Common Crawl Data is stored in WARC files (Web Archive), an open-source format. 

So with all this data, there should be a lot of things to do! 

Some ideas I had at this point:

* Count the length of all payloads across all pages on the internet and get some statistics.
* See how popular certain HTML tags are.
* Perform some semantic analysis on pages referring to presidents or politics.
* Look at how extreme right communities differ from extreme left communities in terms of vocabularies and word frequencies.
* Similarly, compare places like **4chan** and **Reddit** with each other. Who's more vile? There's some easy libraries for sentiment analysis..

And so on.. but what I also played with is something closer to home. I kayak a lot and the kayaking community in the Netherlands is slowly dying: young people are turning away from adventurous sports in general, and kayaking is seen as boring when compared to other, fast-paced water sports (Not necessarily true, but still). Could I try to find places where it's worthwhile to advertise about kayaking perhaps? Or identify communities of people who also kayak, e.g. mountain bikers, sailers, bikers etc? Or perhaps from another perspective, can I try to do some dynamic filtering based on brands or parts of the sport to see what people associate it with?

Plenty of ideas, so let's get started. 

## Part 2 - Setting up
I'm using my Windows laptop running a (Ubuntu) virtual machine which will be used to connect to SurfSara and develop the code. Similarly to the previous assignment in this series this works with a docker image and lots of command line work. Nothing to be scared of. 

Running an example program worked fine on the cluster. But I wanted something more than (redirectable) output in my terminal. 

In order to track the jobs given to Hathi a web interface is available. This is not really supported on Windows, but still doable. Using the [Heimdall implementation](http://www.secure-endpoints.com/heimdal/) of Kerberos and the [Identity Manager](https://www.secure-endpoints.com/netidmgr/v2//) I can set up my credentials. I found that I needed to stray from the [sort-of specific instructions courtesy of the Uni of Edinbourgh here](http://computing.help.inf.ed.ac.uk/kerberos-windows) and actually ended up installing the Heimdall tools fully. I then had to tweak a couple of configurations inside my firefox browser in order to work with Kerberos, but I finally could inspect the progress of my submissions. This seems easy, but in the end was a non-trivial part that took hours to do and even then Firefox was prone to memory leaks.  

*(Screenshot lost to time: a snapshot of the web interface reporting on the progress of a submission.)*

## Part 3 - A local test
I started working with the spark notebook that was provided and after some tweaking around I could run code on a local WARC file containing the course website. This was an iterative process: I started with the grand idea of what I could do but after a few hours I found that I still had made no progress. Following Arjen's suggestion of settling for a simpler challenge when stuck I tried to implement the most basic word count. This was OK-ish, and could be expanded to the full crawl albeit a bit sluggish (slow), which would be decent towards meeting the assignment criteria but I'll let you be the judge of that. 

I also avoided SQL this time, as I recall reading that there are some issues when running SQL-queries on something of the order of 100TB. This could complicate things considering our 'stack' already consists of so many applications and tools. Additionally, having worked with MySQL as a teenager I'm still pretty sure that straight up SQL queries on non-indexed text fields is a baaaad idea.  

I felt like I still really wanted to do more with the kayaking thing. After some pondering I settled on the following order of battle:

1. Convert the crawl to text and look for the string `kayaking`
2. For the full crawl: figure out how to filter for a specific brand (e.g. `bever`)
3. Construct a word count list upon the pages that get returned
4. Output these to a file so I can work with it
5. Visualize a word cloud, e.g. using the `d3.js` method already readily available, or something in python (This is outside the scope of this assignment, and I'll add it later)


So I started with filtering for the text string `kayaking` after calling Arjen's HTML2Text method (step 1).

```
    map(wr => HTML2Txt(getContent(wr._2))).
    map(w => w.toLowerCase()).
    filter(w => w.contains("kayaking")).
```

Now on the basic corpus this returns my own page obviously, as I overshared my love for kayaking a fair bit. 

As per [Apache Spark's example a word count](https://spark.apache.org/examples.html) is implemented with just a few lines of code (step 2):

```
    textFile.flatMap(line => line.split(" "))
                     .map(word => (word, 1))
                     .reduceByKey(_ + _)
```

This is a bit crude, as the "words" will include code snippets like the one found on this blog, and random gibberish like solitary punctuation marks. For a full pass over the crawl though I don't think it'll matter, as full words will drown out the noise. 

So now I've got a big old list of words with counts. Can I save this? Locally, I can use:

`warcl.saveAsTextFile("testje.txt")`


I'm guessing this will be different for the full crawl but one problem at a time. This creates a folder (!) with several files: output can be found in one file here. It's interesting that everything to save into a text file was done below the hood without a warning being thrown at my face for not saving to a hdfs!

*(Screenshot lost to time: much surprise when testje.txt turned out to be the folder and not the file!)*

There are some caveats with this:
* In the presentations some people noticed an integer overflow when using word counts, can I figure out something for this?
* I need to filter out common words such as "a", "the" and so on. I can do this at a high level or when making the visualisation later on. Will save the problem for now..
* Between the docker container and my Ubuntu host I found that I can copy files using docker cp. What if my files are big, though? And what happens on the full crawl. Write to standard output and just do everything on the cluster? 
* May I need to purge tags and code from my result file?
* How can I easily scale this up to.. say looking at 20 brands at once?

As was shown in the terminal above, it doesn't make sense yet to construct a word cloud from a single page, I suppose though that the same steps go for the full cluster. Let's move on and see if we can export the code to the full crawl!

## Part 4 - From Concept to Cluster
The following section will detail the process I went through when exporting the app to the cluster. 
### Attempt 1 - Top 300 words over all sites containing "Kayaking"
The first attempt is going to go over the entire crawl and look for the term 'kayaking' amongst the payload of all sites. I see some potential issues with this.. mainly because I'm asking for the entire crawl to be parsed through html2text - I reckon that is going to be an immense bottleneck. 

The core idea is explained in the following two code snippets..

```
val warcc = warcf.
    filter{ _._2.header.warcTypeIdx == 2 /* response */ }.
    filter{ _._2.getHttpHeader().statusCode == 200 }.
    filter{ _._2.getHttpHeader().contentType != null }.
    filter{ _._2.getHttpHeader().contentType.startsWith("text/html") }
    .map(wr => HTML2Txt(getContent(wr._2)))
    .map(w => w.replaceAll("[?!,.\"-()]", ""))
    .map(w => w.toLowerCase())
    .filter(_ != "")
    .filter(w => w.contains("kayaking"))
    .cache()
```

The above snippet checks for non-empty input and skips it. It should be refactored, but I'm still working on more ideas so I felt it should not be a big priority right now.

It also checks for odd characters, e.g. ?! et cetera- we don't want any of that sillyness. 

Finally, this big pile of text needs to get filtered for the phrase `kayaking` - I expect this line just after HTML2Txt to be a huge bottleneck. 

The next snippet does the standard MR word count. I've added a sort and top-300 selection. 

```
//now to construct a list with anything in the pages we have found per spark word count example https://spark.apache.org/examples.html
val warcl = warcc.flatMap(_.split(" "))
     .filter(_ != "")
     .map(word => (word, 1))
     .reduceByKey(_ + _)
     .filter( w => !(commonWords.contains(w._1)))
     .sortBy(w => -w._2)
     .take(300) 
```

Lastly, this gets printed to the output. 

#### Filtering for Common words
I browsed around for a solution to the common word problem, as I didn't feel like editing my top 300 list every time. So I found [this stackoverflow question](https://stackoverflow.com/questions/41618474/filter-stop-words-in-spark) about filtering words out of my input, by means of a sequence. 

So I still needed a sequence at that point, and I found [this list of English stop words..](http://xpo6.com/list-of-english-stop-words/) which brings me to wonder if I'm going to see other languages pop to the top of the list. One problem at a time though. For clarity, here's the complete list. 

```
val commonWords = Set("a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the")
```

#### Getting the code to Hathi
So right now I have a very basic and simple example Scala app which is confined to the notebook. I still need to do some house keeping in order to get it on the cluster.

The first step is exporting it to scala. This opens the file in my browser. **I stored the file in a public location on the web (so I could get it via wget from the docker and pushed my updates to it** - this allowed me to edit the file using the tools on my own machine and pull it when I want to run it on the cluster. This greatly reduced my effort by reducing my dependency on tools like `vim` - which, while excellent, do not have the range of capabilities like atom or VS Code do. Again, personal preference. 

I then used the skeleton from the example app on the hathi-surfsara image, replacing the original file and deleting the `/target/` folder. I made sure to follow the steps needed [in the creating a self-contained app tutorial](http://spark.apache.org/docs/2.1.1/quick-start.html#self-contained-applications): which meant stripping some code and defining a main method. Additionally, I added `jsoup` to the `libraryDependencies`. 

Using `sbt assembly` I then created a fat jar (stored in `/target/`) and submitted it via 

`spark-submit --master yarn --deploy-mode cluster --num-executors 300 --class `
`org.rubigdata.RUBigDataApp /hathi-client/spark/rubigdata/target/scala-2.11/RUBigDataApp-assembly-1.0.jar`

So for the next 1 minute 40 seconds I was thrilled! Hathi picked up my submission and seemed happy to do it. Then I got a nullPointerException.. turned out I was checking for the `contentType` before even checking if this wasn't `null` instead of the other way around.. eager beaver. I had the bright idea to implement a check for it, but did so in the wrong order.

The next big error was regarding my use of `saveAsTextFile`. Because this would be called many times (once per warc file?) I would get the error that the folder already existed. I took the saveAsTextFile out, and redirected output about the top 300 to the stdout instead. 

After this small fix the code was submitted and I went to bed..

After **8 hours, 36 minutes and 45 seconds** my code apparently hit an error: potentially having to do with a block being unavailable on the cluster. Just as I was rolling over hugging my pillow, the little cluster named Hathi was in tears. Had it failed the user, or had the user failed it?

```
User class threw exception: org.apache.spark.SparkException: Job aborted due to stage failure: Task 1263 in stage 0.0 failed 4 times, most recent failure: Lost task 1263.3 in stage 0.0 (TID 3214, worker168.hathi.surfsara.nl, executor 256): org.apache.hadoop.hdfs.BlockMissingException: Could not obtain block: BP-16922093-145.100.41.3-1392681459262:blk_1262268700_188594112 file=/data/public/common-crawl/crawl-data/CC-MAIN-2016-07/segments/1454701146196.88/warc/CC-MAIN-20160205193906-00216-ip-10-236-182-209.ec2.internal.warc.gz
at org.apache.hadoop.hdfs.DFSInputStream.chooseDataNode(DFSInputStream.java:945) 
at org.apache.hadoop.hdfs.DFSInputStream.blockSeekTo(DFSInputStream.java:604) 
at org.apache.hadoop.hdfs.DFSInputStream.readWithStrategy(DFSInputStream.java:844) 
at org.apache.hadoop.hdfs.DFSInputStream.read(DFSInputStream.java:896)
at java.io.DataInputStream.read(DataInputStream.java:149) 
```

I tried to google the error, but found nothing that I could do as a normal user of the cluster. Most of these had to do with missing privs (might be possible) or corruption. 

[Link to the application details](http://head05.hathi.surfsara.nl:8088/cluster/app/application_1486393309284_17724)

I've posted an issue, meanwhile I'm going to run it on a single warc segment. 

### Attempt 2 - One segment

Using the index I've looked for `https://www.ukriversguidebook.co.uk/` - a large internet community of kayakers. This gives me a neat [JSON output](http://index.commoncrawl.org/CC-MAIN-2016-07-index?url=https%3A%2F%2Fwww.ukriversguidebook.co.uk%2F&output=json) containing the locations of all hits. I just picked one- and added it to my code as `"/data/public/common-crawl/crawl-data/CC-MAIN-2016-07/segments/1454701148402.62/*"`. The rest of the code remained unchanged for the reproducibility of errors. I submitted it with 300 executors and went to get a shave. 

15 minutes and 15 seconds later the submission was done, much to my surprise. I had covered 698 tasks. Bear in mind this submission was 1% of the entire crawl, and I stomped through with 300 executors. No error was given, and my glorious output was waiting for me. 

The following screenshot shows the inside of the Applicationmanager just after starting. Honestly, glancing over this felt like being inside mission control at NASA. 
*(Screenshot lost to time: the Spark jobs overview inside the ApplicationManager.)*

Now the curious reader will want to know.. what did we get from this? 

Earlier I redirected output to stdout: this is where my little frequency list ended up. 

```
womens;849513;
ski;774168;
jackets;738558;
-;703664;
 ;673135;
clothing;614007;
snowboard;581317;
accessories;492069;
pants;475875;
bike;467037;
bikes;463572;
mens;460966;
bags;456382;
shop;430335;
sunglasses;426637;
shoes;423502;
```

There's still some noise. Apparently I missed a white space and '-'... oh well.  

This list seems to indicate that most websites referring to kayaking sell clothing and gear for outdoor activities. That makes sense, given that this is a huge industry with many competitors. Perhaps it would be a good idea to create a second list with words common in retail. It's interesting that words like `sea` and `nature` don't appear at all. The word `safety` - which is at the heart of the sport is ranked #273. Perhaps this is just a batch with a lot of retail sites, but it seems like a decent idea to mine retail terms in order to filter them out for the next iteration. 

So I started to work and added another 150 words to the list with all those retail phrases. I refined the method and submitted the jar once more. Nothing was really different apart from a little retouching. Again, the code worked fine and I got a new list! 

I then wrote a little bit of javascript to convert the frequency list I had to a payload that could be used for a word cloud (credits: https://github.com/wvengen/d3-wordcloud) and generated the visualization. 

*(Screenshot lost to time: the first word cloud generated from the kayaking filter.)*

The word cloud is pretty cool. Most of the junk has been filtered and we see a lot of sports and outdoor-related terms. I guess that the market for kayaking is the same as the market for bikes and wakeboarding. As a mountain biker myself this is amusing. It also shows Wisconsin. This might be random, but the American state also borders lake Michigan and other large lakes and rivers. 

### Attempt 3 - Selective filtering, and finding brands!

Lastly I wanted to filter this subsection for specific brands. While I could easily create a list of 50 or so brands of varying popularity I chose Rockpool. Rockpool is a manufacturer of sea kayaks with several models being extremely popular in the expedition kayaking scene. In a year or so, when I graduate.. you can pretty much guess where my pay check is going to. Look at this boat!

![A Rockpool kayak model: The Taran (source: ebay)](/images/surfsara-rockpool-taran.jpg)

Jokes aside, let's find the same word list as for kayaking. I added a brands set at first, but that didn't work out quite well. While I could iterate through it with the following code..

```
val brands = Set("p&h", "valley", "rockpool", "peakuk")
for (brand <- brands) {
    println(brand+"\n")
        val warcd = warcc /*temp*/
        warcd.cache()     /*lazy evaluation*/
        val warcl = warcd.filter(w => w.contains(brand))
            .flatMap(_.split(" "))
            .filter(_ != "")
            .map(word => (word, 1))
            .reduceByKey(_ + _)
            .filter( w => !(commonWords.contains(w._1)))
            .sortBy(w => -w._2)
            .take(300) 
```

I would continously narrow down my collection. E.g. the first brand would go fine, but the second brand would be filtered from the subsection of the first brand and so on. This is due to Spark's Lazy Evaluation^tm where nothing is actually executed until a reduce operation- and in my code I only used `reduceByKey` until the end of each brand-specific execution. Regardless, being my favourite kayak manufacturer I chose Rockpool and got the following list: 

```
{text: 'nov', size: 439},
{text: 'mar', size: 407},
{text: 'jan', size: 382},
{text: 'dec', size: 379},
{text: 'apr', size: 369},
{text: 'feb', size: 363},
{text: 'oct', size: 362},
{text: 'jul', size: 355},
{text: 'jun', size: 352},
{text: 'sep', size: 338},
{text: '2006', size: 282},
{text: 'aug', size: 265},
{text: 'ago', size: 216},
{text: 'stay', size: 214},
{text: 'cottage', size: 214},
{text: '13', size: 202},
{text: 'loch', size: 201},
{text: '12', size: 199},
{text: '16', size: 194},
{text: 'holiday', size: 194},
{text: 'house', size: 193},
{text: '21', size: 189},
{text: '11', size: 188},
{text: '17', size: 188},
{text: '20', size: 186},
{text: '22', size: 185},
{text: '15', size: 181},
{text: '14', size: 179},
{text: '27', size: 176},
{text: '19', size: 174},
{text: 'night', size: 174},
{text: '28', size: 169},
```
While some words are close (e.g. `loch`) it seems we picked up a lot of calendar or blog contents. After some manual (I'm not going to run this on the cluster and wait another 20 minutes) removal of the nonsense I got the following list: 

```
{text: 'ago', size: 216},
{text: 'stay', size: 214},
{text: 'cottage', size: 214},
{text: 'loch', size: 201},
{text: '16', size: 194},
{text: 'holiday', size: 194},
{text: 'house', size: 193},
{text: 'night', size: 174},
{text: 'home', size: 167},
{text: 'details', size: 165},
{text: '18', size: 157},
{text: 'view', size: 156},
{text: 'min', size: 155},
{text: 'book', size: 155},
{text: 'great', size: 137},
{text: 'views', size: 137},
{text: 'away', size: 127},
{text: 'sea', size: 126},
{text: 'reviews', size: 125},
{text: 'close', size: 118},
{text: 'years', size: 117},
{text: 'sleeps', size: 114},
{text: '5/5', size: 110},
```
This is more like it. I kept the 16 and 18 as they are both kayak models. Overall, I pruned about 50 words- I might add a regular expression on my next run on the cluster. However, something like `5/5` (a rating, included in the list above) might get lost unintentionally. The word cloud on 'Rockpool' is as follows:

*(Screenshot lost to time: the word cloud for filtering `kayaking` along with the brand `rockpool`.)*

The only downside to this is the small corpus I get. Even though I used 1% of the common crawl, most of the words appear about 200 times. I wish I could run it again to get more data, but I do not want to drain up the entire cluster for a entire day. 

### EDIT: Full crawl!
I re-submitted the first job that went over the entire crawl. This time I used the retailWords list, as well as filtering for pages that also contained the word `sea`. I opted to get the top 1000 words instead. The submission was succesful and ended after 10hrs, 47mins, 12sec. In total 69800 jobs were queued. The top 20 words on the entire crawl are:

```
    'snowboard' 58172829
    'accessories' 47357717
    'bike' 46462542
    'bikes' 45888592
    'shop' 40646038
    'country' 28916820
    'water' 27793604
    'cross' 26669810
    'casual' 26185575
    'gear' 22752323
    'wisconsin' 21410085
    'wakeboard' 21104545
    'travel' 19564475
    'packages' 18880893
    'hiking' 18660510
    'forum' 17253484
    'helmets' 16881583
    'royal' 16747143
    'bindings' 16617302
    'house' 15067835
```

And the resulting word cloud is as follows:

![A full pass over the crawl resulted in the top 1000 words related to Kayaking.](/images/surfsara-wordcloud-fullcrawl.png)

That concludes this blog post!

## Part 5 - Evaluation
In the above post I walked you through my adventures with the Common Crawl and the Dutch National Hathi Hadoop Cluster. I started off with basic examples and tried to solve my own problems as I went. Eventually I formed the idea of generating a word cloud based on the term `kayaking`. When it apparently was not possible to make a pass over the entire crawl I grabbed a 900 GB partition and worked with 1% of the data. My idea was still to look for how individual brands are viewed: e.g. what words are asociated with brands like Rockpool?  Finally, I used javascript and the `d3.js` library to generate word clouds of my findings. 

Though I feel like I had to water down my challenges I feel like there's a lot of things that I can still do with all this data. I'm still in unfamiliar territory and I learnt more each time. I'm still working on this project and I'd like to continue building a few interesting vizualisations. I'm glad I didn't do the standard project, and it just feels better to try out many different things and get something of yourself out of a project like this.

Overal I spent about 40 hours or so on this project. 

Dear reader, I thank you for your interest in this blog. 


## Part 6 - Course Evaluation
Though I already submitted the course evaluation I felt like it would be nice to include a few words on the process I went through for this course. I feel that using git, github and in particular the github pages tool - were enriching and powerful. I'm planning on including this repo with my own website, although I havent updated the latter in over two years. If I was a 2nd or 3rd-year student however, this would have instantly given me a portfolio of sorts which is incredibly useful to have. 

The way we went about it, trying to document our struggles with the various tools as we go is much closer to reality than just handing in a polished report that gets written after the product is already done. I would have liked more structure up front to combat the hours of troubleshooting I suppose, but in the end it turned out fine with just the support I found in the issue tracker and google. 

Speaking of the issue tracker, I think this was a great addition to the course and I hope it gets included for the students next year. It certainly helped a lot, and it breaks down the hurdles for students to step out and ask for help. I would advise to keep using it!  

// Jeffrey