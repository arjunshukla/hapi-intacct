[![Build Status](https://travis-ci.org/arjunshukla/hapi-intacct.svg?branch=master)](https://travis-ci.org/arjunshukla/hapi-intacct)
[![Coverage Status](https://coveralls.io/repos/github/arjunshukla/hapi-intacct/badge.svg?branch=master)](https://coveralls.io/github/arjunshukla/hapi-intacct?branch=master)
[![npm version](https://badge.fury.io/js/hapi-intacct.svg)](https://badge.fury.io/js/hapi-intacct)
[![Dependency Status](https://david-dm.org/arjunshukla/hapi-intacct.svg)](https://david-dm.org/arjunshukla/hapi-intacct)
[![devDependency Status](https://david-dm.org/arjunshukla/hapi-intacct/dev-status.svg)](https://david-dm.org/arjunshukla/hapi-intacct#info=devDependencies)
# hapi-intacct
Hapi Plugin for Intacct API's

# Install and Run
Add your .env file first!
```
npm install
npm run start
```

Visit [here](http://localhost:3000/intacct/invoice?query=RAWSTATE%20%3D%20%27A%27%20AND%20PAYPALINVOICEMESSAGE%20not%20like%20%27Invoice%20Sent%20Successfully%27%20AND%20%20WHENCREATED%20%3E%20%277%2F31%2F2017%27)

For now you can pass any URL encoded string as query parameter.  The above link is the query we had in the other application.  It has no invoices because of the WHENCREATED.  This [one](http://localhost:3000/intacct/invoice?query=RAWSTATE%20%3D%20%27A%27%20AND%20PAYPALINVOICEMESSAGE%20like%20%27Invoice%20Sent%20Successfully%27) will get you some invoices.



# Usage

See test/server.ts file

