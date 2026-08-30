# FINAL PROJECT

# Deploy and Contribute to the JavaScript Chat Application

**Prepared by Yared**
**For: Hiruy Students**

---

## Project Overview

In this final project, you will work with the **JavaScript AI Chat Application** that we built in the previous class.

The instructor has already placed the project on GitHub.

Your job is to:

1. Get your own copy of the project.
2. Run and understand it.
3. Create your own branch.
4. Make an improvement.
5. Commit your changes.
6. Push your branch to GitHub.
7. Create a Pull Request.
8. Respond to feedback if necessary.
9. Get your contribution merged.
10. See the updated application deployed with Vercel.

The purpose of this project is not only to improve the application.

It is to practice the workflow real developers use when **contributing to an existing project**.

---

# STEP 1 — Fork the Repository

Open the instructor's GitHub repository.

Click:

**Fork**

GitHub will create your own copy of the project.

The relationship is:

```text
Instructor Repository
        ↓
      Fork
        ↓
Your Repository
```

### Your goal

You should now have the project inside **your own GitHub account**.

Do not start changing code directly on the instructor's repository.

---

# STEP 2 — Clone Your Fork

Open **GitHub Desktop**.

Choose:

**File → Clone Repository**

Select **your fork**.

Then choose where you want to save the project on your computer.

The workflow is:

```text
Your GitHub Repository
        ↓
       Clone
        ↓
Your Computer
        ↓
      VS Code
```

Open the cloned project in **VS Code**.

---

# STEP 3 — Run the Existing Project

Before changing anything, make sure the original project works.

Open the application and test it.

You should be able to:

- Enter a prompt.
- Send the prompt.
- Receive an AI response.
- Ask another question.
- Continue the conversation.

Do not immediately start changing the code.

First understand what is already there.

---

# STEP 4 — Understand the Project

Look at the three main files:

```text
index.html
style.css
script.js
```

Understand what each file does.

### HTML

Responsible for the structure:

```text
Page
 ↓
Chat area
 ↓
Input
 ↓
Send button
```

### CSS

Responsible for the appearance:

```text
Colors
Layout
Spacing
Buttons
Messages
```

### JavaScript

Responsible for the behavior:

```text
User Input
     ↓
JavaScript
     ↓
fetch()
     ↓
AI API
     ↓
Response
     ↓
Display on Page
```

You should be able to explain the basic flow of the application before making your contribution.

---

# STEP 5 — Create Your Own Branch

Do not make your changes directly on `main`.

Create a new branch for your work.

Examples:

```text
student-yared
```

or:

```text
feature-clear-chat
```

or:

```text
feature-character-counter
```

The idea is:

```text
main
 ↓
New Branch
 ↓
Your Changes
```

Your branch protects the main project while you work.

---

# STEP 6 — Choose One Contribution

Your contribution does not need to be large.

Choose **one useful improvement**.

Examples:

### User Interface

- Improve the chat layout.
- Improve message styling.
- Improve button styling.
- Improve mobile responsiveness.

### JavaScript

- Add a Clear Chat button.
- Add a character counter.
- Improve input validation.
- Add an Enter key to send messages.
- Add a typing/loading indicator.
- Prevent sending multiple requests at once.

### User Experience

- Add a welcome message.
- Improve error messages.
- Add a better empty-chat screen.
- Improve the loading experience.

### Important

Do not rebuild the entire application.

Your goal is to practice:

> **Contributing to an existing project.**

---

# STEP 7 — Test Your Change

After making your change, test the application.

Ask yourself:

- Does the application still work?
- Does the original chat still work?
- Does my new feature work?
- Does it work after asking multiple questions?
- Did I accidentally break another part of the application?

Do not commit code that you have not tested.

---

# STEP 8 — Review Your Changes

Open **GitHub Desktop**.

Look at the list of changed files.

Read the changes carefully.

Make sure you understand what you changed.

Think:

```text
What did I change?
Why did I change it?
Does the application still work?
```

This is an important developer habit.

---

# STEP 9 — Commit Your Work

Once your changes are ready:

**Commit the changes.**

Use a meaningful commit message.

### Good examples

```text
Add clear chat button
```

```text
Improve chat message styling
```

```text
Add character counter
```

```text
Improve mobile layout
```

### Avoid messages like

```text
update
```

```text
test
```

```text
new
```

Your commit message should explain what you did.

The workflow is:

```text
Make Changes
     ↓
Review Changes
     ↓
Commit
```

---

# STEP 10 — Push Your Branch

Your changes are currently only on your computer.

Push your branch to GitHub.

In GitHub Desktop, click:

**Push origin**

The workflow becomes:

```text
Local Branch
      ↓
     Push
      ↓
GitHub Branch
```

Now your contribution exists on GitHub.

---

# STEP 11 — Create a Pull Request

Open your GitHub repository.

GitHub should show an option to create a Pull Request from your branch.

Create the Pull Request.

Your workflow is:

```text
Your Branch
     ↓
Pull Request
     ↓
main
```

### Pull Request description

Explain what you changed.

Example:

```text
I added a Clear Chat button.

The button removes all messages from
the chat window and allows the user
to start a new conversation.
```

Keep the description clear and understandable.

---

# STEP 12 — Instructor Review

The instructor will review your Pull Request.

There are two possible outcomes.

### Approved

```text
Pull Request
      ↓
   Review
      ↓
   Approved
      ↓
    Merge
```

Your contribution becomes part of the main project.

### Changes Requested

The instructor may ask you to make improvements.

For example:

```text
The button works, but please move it
to the top-right corner of the chat.
```

Do not create another Pull Request.

Instead:

```text
Instructor Feedback
        ↓
Make Changes
        ↓
Commit
        ↓
Push
        ↓
Pull Request Updates
```

Your new changes will automatically appear in the existing Pull Request.

This is an important part of real-world development.

---

# STEP 13 — Merge

Once your Pull Request is approved, the instructor will merge it.

The workflow is:

```text
Your Branch
      ↓
Pull Request
      ↓
Review
      ↓
Approved
      ↓
Merge
      ↓
main
```

Your code is now part of the main project.

---

# STEP 14 — Vercel Deployment

When the main repository is connected to Vercel, the deployment workflow becomes:

```text
Pull Request
      ↓
Merge
      ↓
main
      ↓
Vercel
      ↓
Build
      ↓
Deploy
      ↓
Live Website
```

The updated application can now be viewed online.

---

# STEP 15 — Practice Git Again

After your first contribution, make another small improvement.

For example:

```text
Contribution 1
    ↓
Branch
    ↓
Commit
    ↓
Push
    ↓
Pull Request
    ↓
Merge
```

Then:

```text
Contribution 2
    ↓
New Branch
    ↓
Commit
    ↓
Push
    ↓
Pull Request
    ↓
Merge
```

The more you repeat the workflow, the more comfortable Git and GitHub become.

---

# Git Workflow to Remember

Memorize this:

```text
FORK
  ↓
CLONE
  ↓
BRANCH
  ↓
CODE
  ↓
TEST
  ↓
COMMIT
  ↓
PUSH
  ↓
PULL REQUEST
  ↓
REVIEW
  ↓
FIX
  ↓
PUSH AGAIN
  ↓
MERGE
  ↓
VERCEL DEPLOY
  ↓
LIVE WEBSITE
```

---

# Final Project Requirements

Your project should contain:

- [ ] Working AI chat application
- [ ] HTML, CSS and JavaScript
- [ ] Multiple questions and responses
- [ ] AI API integration
- [ ] Your own GitHub fork
- [ ] Your own working branch
- [ ] At least one meaningful contribution
- [ ] At least one meaningful commit
- [ ] Branch pushed to GitHub
- [ ] Pull Request created
- [ ] Pull Request reviewed
- [ ] Contribution merged

### Bonus

Make a second contribution using another branch and repeat the complete workflow.

---

# Final Developer Mindset

GitHub is not just a place to store your code.

It is a place where developers **collaborate**.

A branch allows you to work safely.

A commit records your work.

A Pull Request allows other developers to review your work.

A merge brings your contribution into the main project.

Vercel connects that development workflow to the live website.

The goal of this project is therefore bigger than building a chat application.

The goal is:

> **Write code → collaborate safely → review code → merge confidently → deploy automatically.**
