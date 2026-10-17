---
title: "Big Data Series - Hadoop and HDFS"
description: "A hello-world walk through Hadoop and HDFS: setting up a pseudo-distributed cluster and running the classic MapReduce word count on the complete Shakespeare."
pubDate: 2017-03-22
category: "Academics"
tags: ["University", "MapReduce", "Hadoop"]
heroImage: "/images/pg-logo-new.jpg"
---

The general idea of this post is to work out a short hello-world type of tutorial. For convenience I'll assume that you have some basic understanding of the idea behind Map-Reduce and why you'd ought to use it. For this post though, I'm not going to go with a very complicated use case, instead sticking to the most basic solution (also I had other deadlines to meet).

Keep in mind that what goes for Shakespeare should also go for [the 450-million in words COCA](https://en.wikipedia.org/wiki/Corpus_of_Contemporary_American_English). Maybe something for next week, Arjen? :)

### Setting up the environment
Since I'm a stubborn old goat I'm running vagrant to run a virtual Ubuntu distribution. Inside of which I'm running a docker container as was requested per assignment. On my laptop, which runs Windows 8. 

Following the [instructions](https://rubigdata.github.io/course/background/hadoop.html) I install hadoop version 2.7.3 and set up a hdfs cluster. There is some non-trivial path setting up involved here, but it goes beyond the scope of this assignment. 

### Getting data
The [Complete Shakespeare](http://www.gutenberg.org/ebooks/100) corpus hosted by Project Gutenberg is only 5.3 MB. Not exactly big data. But for our little tutorial it'll do just fine. For convenience I download it using `wget`...  

### The Hello World Example
Considering everyone in the class had to do the same assignment I'm not going to take you by the hand to lead you through the entire  [Hello World Example on Hadoop](https://hadoop.apache.org/docs/r2.7.3/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html#Example:_WordCount_v1.0) again. However, a short summary is in place: 

The first steps are setting up the cluster. For the standalone version you don't actually have to do much more. However, we can get Hadoop to run on a single node in a pseudo distributed manner. To first do this, we have to edit the xml config files found under etc/hadoop:

etc/hadoop/core-site.xml:

    <configuration>
        <property>
            <name>fs.defaultFS</name>
            <value>hdfs://localhost:9000</value>
        </property>
    </configuration>


etc/hadoop/hdfs-site.xml:
    
    <configuration>
        <property>
            <name>dfs.replication</name>
            <value>1</value>
        </property>
    </configuration>

After that, we need to get hadoop to format a new HDFS:

    bin/hdfs namenode -format
    sbin/start-dfs.sh
    bin/hdfs dfs -mkdir -p /user/root

Now, we pull the corpus and the java file:

    wget http://www.gutenberg.org/ebooks/100.txt.utf-8
    wget https://gist.githubusercontent.com/WKuipers/87a1439b09d5477d21119abefdb84db0/raw/c327b9f74d30684b1ad2a0087a6de805503379d3/WordCount.java


And make the directories we need plus the jar we're going to run:

    bin/hdfs dfs -mkdir input
    bin/hdfs dfs -put 100.txt.utf-8 input
    bin/hadoop com.sun.tools.javac.Main WordCount.java
    jar cf wc.jar WordCount*.class

Finally, we run the jar on the corpus: 

    bin/hadoop jar wc.jar WordCount input output
    bin/hdfs dfs -get output/part-r-00000
    bin/hdfs dfs -rm -r output

We can inspect the results with Nano. This is a bit archaic, but what in computer science isn't?

    nano part-r-00000

In the resulting file we have tuples of each token with the cumulative count of their occurence. Don't be alarmed if it looks off: the script does not actually know that "Juliet." and "Juliet?" refer to the same token. 

**So how does Mapreduce really count these words?**
The `WordCount` java code contains a simpel flow consisting of a map-step that emits words (including special characters such as !?,.:) that are deliited by whitespace along with a count of how many times they were encountered. This processing is done one line at a time.

In the reduce step each map is combined so that we get a nice hash map that sums up the values.
### Food for thought (or other questions..)
**So what happens when you just do the standalone part of the tutorial?**
A standalone operation just builds a single node. This is probably very handy for programming and debugging. In this mode the commands are handled by just a single node which is kind of defeating the purpose of hadoop!

**So what's different in the pseudo-dist case?**
In the pseudo-distributed case we build a simulated cluster with multiple nodes. This would allow big tasks to be done in an asynchronous way. In the pseudo-distributed case I had to do more set-up and much more debugging. 

Really, the standalone variant and the simulated clusters just look like debugging settings for when you can't or will not work on a real cluster. 

**So who's the most popular kid in town?**
So there are more ways to determine who's more popular. If we count purely the amount of times Romeo or Juliet spoke, we just have to look for the lines starting with their name. For Romeo this is "Rom." and he has 167 lines. Our tragic Juliet "Jul." only has 117. 

But who gets the most mentions? "Juliet" is mentioned 68 times, while "Romeo" in all its forms gets mentioned 152 times. 

*Things aren't always fair on fourteen year-olds.  *

Sometimes our brains are able to repress bad memories. However, it all came back to me when I saw the Java code... those long days in a hot and sweaty computer lab, trying to understand OO did however make me into the man I am. 


