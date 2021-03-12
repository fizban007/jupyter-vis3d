from __future__ import print_function
from setuptools import setup, find_packages
import os
from os.path import join as pjoin
from distutils import log

from jupyter_packaging import (
    create_cmdclass,
    install_npm,
    ensure_targets,
    combine_commands,
    get_version,
)


here = os.path.dirname(os.path.abspath(__file__))

log.set_verbosity(log.DEBUG)
log.info('setup.py entered')
log.info('$PATH=%s' % os.environ['PATH'])

name = 'jupyter_vis3d'
LONG_DESCRIPTION = 'A custom 3d visualization library'

# Get jupyter_vis3d version
version = get_version(pjoin(name, '_version.py'))

js_dir = pjoin(here, 'js')

# Representative files that should exist after a successful build
jstargets = [
    pjoin(js_dir, 'dist', 'index.js'),
]

data_files_spec = [
    ('share/jupyter/nbextensions/jupyter-vis3d', 'jupyter_vis3d/nbextension', '*.*'),
    ('share/jupyter/labextensions/jupyter-vis3d', 'jupyter_vis3d/labextension', '**'),
    ('share/jupyter/labextensions/jupyter-vis3d', '.', 'install.json'),
    ('etc/jupyter/nbconfig/notebook.d', '.', 'jupyter-vis3d.json'),
]

cmdclass = create_cmdclass('jsdeps', data_files_spec=data_files_spec)
cmdclass['jsdeps'] = combine_commands(
    install_npm(js_dir, npm=['yarn'], build_cmd='build:prod'), ensure_targets(jstargets),
)

setup_args = dict(
    name=name,
    version=version,
    description='A custom 3d visualization library',
    long_description='A custom 3d visualization library',
    include_package_data=True,
    install_requires=[
        'ipywidgets>=7.6.0',
        'numpy',
    ],
    packages=find_packages(),
    zip_safe=False,
    cmdclass=cmdclass,
    author='Alex Chen',
    author_email='fizban007@gmail.com',
    url='https://github.com//jupyter-vis3d',
    keywords=[
        'ipython',
        'jupyter',
        'widgets',
    ],
    classifiers=[
        'Development Status :: 4 - Beta',
        'Framework :: IPython',
        'Intended Audience :: Developers',
        'Intended Audience :: Science/Research',
        'Topic :: Multimedia :: Graphics',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
    ],
)

setup(**setup_args)
