
first section - put on slides?
What is S3:

meaning of bucket

block v file storage
'object' storage = 3rd way of looking at it -

AWS def of bucket purpose

key features (revise these!)
but esp, REST / file-like access
flat - you look it up by its name, not its position in a hierarchy (so they say)
because it is flat, it stores the information about itself 'in' itself using metadata
because it is looked up by name not position, you don't need to think about where to find the data, or the most efficient way to organise storing it.

Pricing:
    Storage cost: ~ $0.025 / GB / month, for 'warm' access, hourly billing = pay-as-you-use
    API cost for operation of files: ~$0.005 / 10000 read requests, write requests are 10 times more expensive
    Data transfer outside of AWS region: ~$0.02 / GB within AWS, ~$0.08 / GB to the internet.
So what use cases would S3 be suitable for?


Preparation:

If you are able, and you haven't already, install the AWS CLI (version 2)
https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
Make sure you are logged in on github and fork this workshop (using a different name for the repo) and pull it down to your local machine.
go to  
https://console.aws.amazon.com/billing/home?#/account
and note your numeric AWS account ID in the accounts.txt file.

First we will set up the AWS CLI, but for the CLI to authenticate itself to AWS, it will need credentials, that is to say - we will need to make it a User
This is done in an AWS Service called Identity And Management (IAM)
Navigate to the IAM console, create a user with both Programmatic Access and Console Access and add the 'existing policy' called `AdministratorAccess`. Make sure you note down the Secret Access Key.

This policy is, as you would expect, the most powerful access you can have other than the root account (which you are currently logged into). It is good practice to avoid logging into the root account, so we have delegated all its permissions to this new user. AWS encourages this kind of security thinking because AWS accounts can be so valuable and control such cricital resources that risks which may be improbable, such as keyloggers even in well-secured premises, need to be taken seriously.

You should use this new user to log into the AWS Console in future. We have also given the user Programmatic Access so that we can use it with the AWS CLI. The CLI doesn't use a password. Instead it uses Access Keys. If you don't want the keys to your admin account hanging around on your machine, you can remove Programmatic Access at the end of the week, or revoke the Access Keys.


You're now ready to set up the AWS CLI with `aws configure` (see https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html#cli-quick-configuration and use `eu-west-2` as your default region)
Don't lose the secret key, as you will not be able to view it again.
Any time you want to check that your AWS CLI is configured, you can `aws sts get-caller-identity`, which makes a CLI call that does not require any special permissions.
- setting up the AWS CLI will save you time hunting around the AWS console if you need to perform very simple tasks quickly in future. However, for most tasks this week we'll use the AWS console - so you become familiar with the console and its many options.



S3:
make two buckets.
You can choose to add one alias to your account instead of the Account ID.
Either go to
https://console.aws.amazon.com/iam/home#/home and click cusotmise, or run aws create-alias in the terminal.
Add both bucket names (and your alias if you made one) to accounts.txt, add commit, push.


NB Why is 'Do not grant public read access' recommended ?

tangent : Permissions
S3 permissions Tab
What do we mean by “Everyone” and “Any authenticated AWS user”
permissions on permissions - ACL list?

examples:
Jam cams!


File uploader / noticeboard app.

We will use a simple wepage to access pictures we have uploaded to an S3 bucket.
To start experimenting, grab a picture (or any file you can display in a browaser) from the internet, upload it to the bucket.
When you navigate to the picture's URL (ie, on the internet), you'll hit Access Denied.
But keep the tab open, we'll be coming back.

Go to both 'Block public access' in the left pane, and to the Permissions tab of your bucket, and ensure that public access is NOT blocked in either.
Even though these two permission locations have the same name, they work at two different levels. If either of them are turned on (ie are blocking), then access will be blocked.
These are example of 'explicit deny' policies. Explicit deny always takes priority. Anywhere AWS encounters an explicit deny that relates to the action and resource you want, it will block access, no matter how many `allow`s it also encounters.
Check out the Access Control List - ACLs are another layer of 'explicit deny'. Luckily, in this default ACL, no denials are set.

Now try to navigate to the picture's URL.
It's still Access Denied.

Even though we didn't block public access, we didn't allow it either.
This is an example of AWS's 'default deny' policy.

We'll need generate a policy that allows the public access.
Before we do this, go to the list of buckets and click the checkbox for your bucket so that we can Copy Bucket ARN.
Click on the bucket name again and go back to the Permission Tab.
Find the Policy Generator (open it in a new tab) and add a Get Object action to a statement for the `*` Principal (`*` means everyone).
When entering the ARN, you can compare it with the general form of the ARN in grey under the ARN textbox, and see how it is composed. It's not a pretty naming system. Imagine trying to work out what went wrong if you accidentally missed a colon out of the ARN :(
Copy the JSON the Policy Generator generates and paste it into the editor.
You are almost ready to save the policy but there is one last gotcha -
The ARN you copied refers to the bucket, not to the objects in the bucket. The ARN naming system for S3 works a little like filenames on a disk - there are (conceptually, even if not in reality) folders separated by `/` and you can use the wildcard `*`.
So `arn:aws:s3:::app-that-makes-ya-go-aw` refers to a bucket, `arn:aws:s3:::app-that-makes-ya-go-aw/` refers to a folder and `arn:aws:s3:::app-that-makes-ya-go-aw/*` refers to all of the resources (including subfolders) within that folder.
Once you've edited the policy to allow `*` access to the resources in the bucket and saved it, you should be able to access the picture via its URL.

Check out the Access Analyzer for your S3 (in your region)
https://s3.console.aws.amazon.com/s3/access?region=eu-west-2
There won't be an Analyzer set up yet, so click through.
In the messages at the top of the screen, you should see the blue message 'Scanning Resources'.

Since we have allowed some public access to the bucket, AWS sees this as a potential security problem. Since we intended this bucket to be for public access, this is fine.

You can return to this page at the same URL, but this won't make the Analyzer rescan. To reach the option to Rescan, you need to click on a 'finding' in the lists in one of the tabs.
If you don't have any 'findings', it means your bucket is secured against public access (but also means that you'll need to delete and recreate the Analyzer in 'Analyzer details' if you want to force a rescan).


In the `picUrls` array `main.js`, comment out the local filename and add a string to the array containing the picture's URL. Now when you access index.html in your browser, the page should try to fetch the picture from the bucket.
Nothing will show in the browser, however - check why not by opening the browser console. you should find a CORS error (if you find some other error, go back and check your edits to `main.js`). This is one more layer of security we need to deal with, but this one comes from your browser. Even so, we deal with it in the AWS console.
Add this CORS policy in the CORS tab:
```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>GET</AllowedMethod>
        <MaxAgeSeconds>3000</MaxAgeSeconds>
        <AllowedHeader>Authorization</AllowedHeader>
    </CORSRule>
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>PUT</AllowedMethod>
        <MaxAgeSeconds>3000</MaxAgeSeconds>
        <AllowedHeader>Content-Type</AllowedHeader>
        <AllowedHeader>x-amz-acl</AllowedHeader>
        <AllowedHeader>origin</AllowedHeader>
    </CORSRule>
</CORSConfiguration>
```
and, on refreshing the page, your image should show in the browser.

Now we've verified that our bucket works to read from, we can start to think about write access. We'll be using the file upload.js to upload.

Everything in AWS requires permissions to be explicitly set - often in multiple places.
But before we can grant permissions, we will need someone to grant permissions to. This could be a Role, but in this case we will create a User.

So:
Navigate back to the IAM console, create another user and make sure you have a Secret Access Key.

Connect your app up to the first S3 bucket by string the Access Key ID and Secret Access Key in the .env file.
By convention, `.env` or similar is a file we store environment variables, including secrets, for an app. One of the first things to do when making any app which will be stored on a repository such as Github is to include the name of the `.env` file in the `.gitignore` file (it's a list of files want the `git` software to ignore). This makes sure that the secrets in this file are never pushed to Github where they can be stolen.

Task 1:
You used the IAM Console to grant the public read access to the first bucket using a Statement generated in JSON by the Policy Generator. You can use the Policy Generator generator to generate the write permissions to the User you created too, but be careful of how much of the generated policy you cut and paste.



Task 2 research: Your team of consultants has reached a milestone and will hand over access to the client (ie a different company). How would you grant appropriate permissions to only this app's buckets, to only your client's AWS user?

Task 2: pair with someone who is starting task 2 and grant them access to the second bucket.
You will need to grant the `GetObject` permission and also the `ListBucket` permissions to your User in your AWS account. `GetObject` is a permission that acts on an object resource, or a set of object resources, and `ListBucket`, as it sounds, acts on an entire bucket. So the resources will have slightly different ARNs.

Grant read access to AWS account ... (Tom)
You should now have: One bucket which any user on the internet can use, without authenticating, but to which no-one but you can write; Another bucket, which yourself and your client can read and write to, and Tom can read from, with no further permissions than those.

Task 3:
In `index.js`, delete or comment out each filename in the `picUrls` array. This should make the app search the bucket for files it can display - as long as it has permissions to!
In upload.js, set bucketName. Notice that this is a variable for AWS to process internally, passed ot it by the SDK. So this is just the name of the bucket, not an internet-accessible URL.
Grab some more pictures from the internet and store them in the assets/ folder.
Run the upload app (`node upload.js`), to upload pictures to your pair's bucket one by one. Before each upload, though, you will need to set filePath to the local filename.


NB: In a large scale system, we would Block Public Access even to an S3 bucket which we _want_ the public to access, and the public access point would instead go through CloudFront. Mediating requests through CloudFront means you have full control over access control and logging and, especially, load-balancing (which you could not use when requests go direct to S3's endpoints).


Task 4: read:
https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-user.html
and create a policy allowing write access to the user GIFmaker on AWS account ... (Tom).
Before Clicking 'Review Policy', view the JSON of the policy to get an idea of what a populated policy looks like.


Extras 1:
Test each others' security skills by trying to exceed the access you have on their app (this could be your partner or anyone who has started out on extras 1)

Extras 2:
Experiment with Access Analyzer and Trusted Advisor's Bucket Permissions check

Before the end, if anyone has accidentally exposed SECRET keys, stick around and revoke them!
