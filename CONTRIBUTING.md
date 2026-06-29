# Contributing to Weeblix

First off, thank you for considering contributing to Weeblix! It's people like you that make Weeblix such a great tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](https://github.com/Knodl-LLC/Weeblix/issues) first to see if someone else has already created a ticket. If not, go ahead and [make one](https://github.com/Knodl-LLC/Weeblix/issues/new)!

## Fork & create a branch

If this is something you think you can fix, then fork Weeblix and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-new-processing-module
```

## Get the test suite running

Make sure you have Elixir installed.

```sh
mix deps.get
mix test
```

## Implement your fix or feature

At this point, you're ready to make your changes. Feel free to ask for help!

## Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with Weeblix's master branch:

```sh
git remote add upstream git@github.com:Knodl-LLC/Weeblix.git
git checkout master
git pull upstream master
```

Then update your feature branch from your local copy of master, and push it!

```sh
git checkout 325-add-new-processing-module
git rebase master
git push --set-upstream origin 325-add-new-processing-module
```

Finally, go to GitHub and make a Pull Request.

## Keeping your Pull Request updated

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.

## Code Style

We follow the standard Elixir formatting rules. Please ensure your code passes `mix format` before submitting a PR.
