---
title: "Big Data Series - Give me a spark"
description: "Poking at a Kaggle housing dataset in Spark: loading 292 columns, running SQL over it, and hunting for the Kremlin in the data."
pubDate: 2017-05-04
category: "Academics"
tags: ["University", "Spark", "Kaggle"]
heroImage: "/images/give-me-a-spark.png"
---

So the third assignment in this series is running Spark and playing around with it. The first part was basically messing about with the query-processing, the second part is playing with data and dataframes. As these do not actually seem to be part of the required stuff for the post, I have left them out completely.  

The way I understand this is that I'm supposed to play with Spark, come up with something new, and write a short blog post detailing my experiences. 

> Alternatively, you could decide to carry out a small analysis of a different open dataset, of your own choice; and present to your readers some basic properties of that data. You will notice that it is harder than following instructions, and you run the risk of getting stuck because the data does not parse well, etc.

So without further ado, let's explore some datas. 

### Part 1 - Getting data
Kaggle is one of the top resources for Data Science competitions, where data scientists, analysts, and programmers of all flavors unite and compete for prizes. While IMO prize money mostly seems to go to people who already have top-tier knowledge (like people who work at Deepmind) or just a lot of time/resources behind them (I recall reading some people spend 5 hours a day on a competition, which would probably make the pay-off very poor for their time investment), it's kind of a data geek playground. I have selected the [Sberbank competition](https://www.kaggle.com/c/sberbank-russian-housing-market) which was launched recently. 

The first step is simply downloading the accepting the conditions of the competition, and downloading a zip file for training and test data. Additional data about Russia's economy is available in different files, and the file description hints that these may be joined together with the proper instructions. All the data is in comma-seperated values. The training data is 44 MB. Because one cay only download the data once authenticated and I'm using a virtual machine, I've hosted the dataset elsewhere before pulling it in with `wget` as this seems an easier solution than setting up a shared partition.

### Part 2 - Import 
if you are interested in following along, use `wget https://www.dropbox.com/s/4dmsg68lc509q32/train.csv?dl=0`. I'll make sure this file stays available for the next few weeks.

Importing the data can be done with the same instructions as any other csv. 

    val rusdata = spark.read.format("csv").option("header", true).load("notebooks/BigData/data/train.csv?dl=0").cache()

With `printSchema` I can take a look at the schema of the data set. This also allows for verification that everything got loaded in. 

    rusdata.printSchema

Which outputs all the fields from the dataset as follows: 

    root
     |-- id: string (nullable = true)
     |-- timestamp: string (nullable = true)
     |-- full_sq: string (nullable = true)
     |-- life_sq: string (nullable = true)
     |-- floor: string (nullable = true)
     |-- max_floor: string (nullable = true)
     |-- material: string (nullable = true)
     |-- build_year: string (nullable = true)
     |-- num_room: string (nullable = true)
     |-- kitch_sq: string (nullable = true)
     |-- state: string (nullable = true)
     |-- product_type: string (nullable = true)
     |-- sub_area: string (nullable = true)
     |-- area_m: string (nullable = true)
     |-- raion_popul: string (nullable = true)
     |-- green_zone_part: string (nullable = true)
     |-- indust_part: string (nullable = true)
     |-- children_preschool: string (nullable = true)
     |-- preschool_quota: string (nullable = true)
     |-- preschool_education_centers_raion: string (nullable = true)
     ....

     rusdata: org.apache.spark.sql.Dataset[org.apache.spark.sql.Row] = [id: string, timestamp: string ... 290 more fields]

292 fields. Not bad!
### Part 3 - Playing 
So now let's explore the data! How does a property object look like, actually?

    rusdata.show(1)

So it's just a single row in this massive csv. Each house has an ID and 290 other properties that go with it. Finally, the last property is the house price itself, which is used in the competition mainly. Something that catches my eye in both of these is the large amount of features that have a suffix of 500, 1000 or 2000. This could be how many of that particular feature are in a 500 or 1000 meter radius around the object. 

Something that is also peculiar is that there are no latitude or longtitude pairs (be it WGS or a Russian format, neither appear) instead the highest "resolution" is the area in which the property is located. E.g in the 'Kremlin' area. This makes data sort of anonymous, but I suspect it would not be hard to identify property objects based on the 292 features that we have if we chose to do this. 

So the first thought.. can we find data on the Kremlin itself? From wikipedia I find that the Grand Kremlin Palace was built between 1837 and 1849 and has a sqaura area of 

>125 metres long, 47 metres high, and has a total area of about 25,000 square metres. It includes the earlier Terem Palace, nine churches from the 14th, 16th, and 17th centuries, the Holy Vestibule, and over 700 rooms

Can we find that?

    val potentialKremlin = rusdata.select("id","full_sq","life_sq","floor","build_year","num_room").where("build_year <= 1849")
    potentialKremlin.count
    904

Now let's filter this again, as we know at that it has 700 rooms.. can we reduce the set of 904 objects to something we can count on our fingers? Let's filter this by selecting objects with more than 10 rooms. 


    val potentialKremlin2 = potentialKremlin.select("id","full_sq","life_sq","floor","build_year","num_room").where("num_room >= 10")

    potentialKremlin2.show()

    +---+-------+-------+-----+----------+--------+
    | id|full_sq|life_sq|floor|build_year|num_room|
    +---+-------+-------+-----+----------+--------+
    +---+-------+-------+-----+----------+--------+

So it seems that the Kremlin is not in the data set, despite being in the Kremlin district. Just to check - are there any properties with more than ten rooms in the data set at all?

    rusdata.select("id","full_sq","life_sq","floor","build_year","num_room").where("num_room >= 10").show()

    +-----+-------+-------+-----+----------+--------+
    |   id|full_sq|life_sq|floor|build_year|num_room|
    +-----+-------+-------+-----+----------+--------+
    |11624|     40|     19|   17|      2011|      19|
    |17767|     58|     34|    1|      1992|      10|
    |26716|     51|     30|   14|      1984|      17|
    |29175|     59|     33|   20|      2000|      10|
    +-----+-------+-------+-----+----------+--------+

It seems that having tons of rooms is simply a more modern fad.

Now, let's do some aggregation. Can we get a list of how many properties there are per region? This time we use SQL directly, but we need a dataframe first:

    val rusdataDF = rusdata.select("id","full_sq","life_sq","floor","build_year","num_room", "sub_area")
    rusdataDF.createOrReplaceTempView("props")
    spark.sql("SELECT sub_area, count(sub_area) AS sa FROM props GROUP BY sub_area ORDER BY sa DESC").show(15)

    +--------------------+----+
    |            sub_area|  sa|
    +--------------------+----+
    | Poselenie Sosenskoe|1776|
    |          Nekrasovka|1611|
    |Poselenie Vnukovskoe|1372|
    |Poselenie Moskovskij| 925|
    |Poselenie Voskres...| 713|
    |              Mitino| 679|
    |            Tverskoe| 678|
    |            Krjukovo| 518|
    |             Mar'ino| 508|
    |Poselenie Filimon...| 496|
    |      Juzhnoe Butovo| 451|
    |Poselenie Shherbinka| 443|
    |            Solncevo| 421|
    |   Zapadnoe Degunino| 410|
    |Poselenie Desjono...| 362|
    +--------------------+----+

    only showing top 15 rows
Note: the sub_areas are supposed to be the 125 raions of Moscow. But are they, actually? 

    spark.sql("SELECT DISTINCT sub_area FROM props").count
    146

So we have more areas than there are raions. This means we should be distrustful of the data: it could at the very least mean that we cannot expect all 125 areas to be present in the data set. 

One of the things we might expect to find is negative or zero entries in the build_year column. Can we find these with a simple SQL statement?


    spark.sql("SELECT id, build_year FROM props ORDER BY build_year ASC").show

    +-----+----------+
    |   id|build_year|
    +-----+----------+
    |11010|         0|
    |12811|         0|
    |11186|         0|
    |10145|         0|
    +-----+----------+
uh oh..

    spark.sql("SELECT id, build_year FROM props WHERE build_year == 0").count
    530

    spark.sql("SELECT id, build_year FROM props WHERE build_year >= 2017").count
    157

So at the very least there's something funny going on with the building year data. But it could also mean that these building are still being built. [A quick look at Kaggle's forum gives the following answer](https://www.kaggle.com/c/sberbank-russian-housing-market/discussion/32247): 

> What 0 and 1 mean in 'build_year" column of the data?

> These are mistakes in the raw data, so we cannot fix it, unfortunately.

And what about the houses that are being built or have been built after the data was collected (as the data is from 2015)
> it could be pre-investment (see product type).

### Part 4 - Findings
I have added most of the queries I processed in the blog text above, but it would be really nice if I could host the spark notebook somewhere like I would with a ipython notebook. 

Overall I'm okay with looking at the data with Spark. For analysis though, I would use Python as it's more established and I can get more support. Additionally, there are a lot of packages available that make development so much more doable. 

I did like working with Spark. The SQL-rich syntax makes it easy to learn, and the things that I found gave me plenty of ammunition to start work in node, R or Python. 