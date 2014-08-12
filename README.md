# RNS-Searcher

RNS-Searcher is a prototype Research Netowrking System
collaboration tool, as described in *Finding Collaborators: Towards
Interactive Discovery Tools for Research Network Systems*, by
C. Borromeo, et al., currently (as of August 2014) under review. 

RNS-Searcher allows a user to search a
[VIVO](http://www.vivoweb.org/) compliant datasource to find research 
collaborators.  The webpages  included in the tool are self-contained
and this disitribution tarball includes all the necessary javascript
and css files. 

The tool can be deployed as a single directory within your web app
directory (ex: /var/www/html).  The  application requires a connection
to a SPARQL endpoint hosting the VIVO data. 
Some sample VIVO datasets can be found at
[datahub](http://datahub.io/dataset?q=vivo). 


## Disclaimer 

As a preliminary research prototype, this code is very
preliminary. Bugs and performance problems are to be expected. Use at
your own risk.


## Configuring the triple store 

The webpage launches its search by allowing the user to select a
search topic (ex: Genomics) from an autocomplete 
textbox.  This functionality was created through the [Virtuoso data
store](http://virtuoso.openlinksw.com/dataspace/doc/dav/wiki/Main/). 
Virtuoso provides standard SPARQL functionality plus a partial text
matching through SPARQL.  As this functionality is not standard in
SPARQL, you may need to find another method for replicating the
partial search if you are usTo enable the partial text matching:
1	Launch the [iSQL interface](http://docs.openlinksw.com/virtuoso/isql.html)

2.	Run this command:
> DB.DBA.RDF_OBJ_FT_RULE_ADD (null, null, 'All');
Note that this command can take some time to run - possibly more than
two hours.


3.	Run this command:
>DB.DBA.VT_INC_INDEX_DB_DBA_RDF_OBJ ();

Note: From this point onward the freetext index is automatically
updated in the background by the  scheduler. However if you want data
to be visible immediately, you can  rerun the
DB.DBA.VT_INC_INDEX_DB_DBA_RDF_OBJ (); command.  

An example SPARQL query using the freetext search:

SELECT ?uri ?label WHERE {?uri <http://www.w3.org/2000/01/rdf-schema#label> ?label  
. ?label bif:contains “<search_term_here>*" } ORDER BY ?label

Note: your <search_term_text> must be at least 4 characters long
 
Please note you may encounter cross-site scripting errors (XSS)
depending on your SPARQL 
server configuration.  The Virtuoso data store has
[configuration
instructions)[http://virtuoso.openlinksw.com/dataspace/doc/dav/wiki/Main/VirtTipsAndTricksGuideCORSSetup]
to help avoid these errors.


## Customizing the code.

Once your triple store is appropriately configured, you will need to
edit two files, updating the value of the *sparql_url* variable to
reflect your local configuration:

1. index.html
2. swimlane_page_reworked.js

Once this is done, you should be able to access the demo by loading
the index.html page.

## Licensing

RNS-Searcher is copyright 2013-2014, University of Pittsburgh. All
components developed by the University of Pittsburgh are distributed
under the MIT License, as indicated by the accompanying LICENSE file.

RNS-Searcher relies upon [jQuery](http://www.jquery.com) and
[D3](http://www.d3js.org) components, which are distributed under
open-source licenses as described in the ./js and ./d3 directories, respectively.


