jupyter-vis3d
===============================

A custom 3d visualization library

Installation
------------

To install use pip:

    $ pip install jupyter_vis3d

For a development installation (requires [Node.js](https://nodejs.org) and [Yarn version 1](https://classic.yarnpkg.com/)),

    $ git clone https://github.com//jupyter-vis3d.git
    $ cd jupyter-vis3d
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --overwrite --sys-prefix jupyter_vis3d
    $ jupyter nbextension enable --py --sys-prefix jupyter_vis3d

When actively developing your extension for JupyterLab, run the command:

    $ jupyter labextension develop --overwrite jupyter_vis3d

Then you need to rebuild the JS when you make a code change:

    $ cd js
    $ yarn run build

You then need to refresh the JupyterLab page when your javascript changes.
