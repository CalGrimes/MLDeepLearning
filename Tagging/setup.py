import os
import sys
import re
import shutil
import pathlib
from setuptools import setup, find_packages
import distutils.command.build

if sys.version_info < (3, 4):
    raise RuntimeError('renom_tag requires Python3')

DIR = str(pathlib.Path(__file__).resolve().parent)

with open("requirements.txt") as reader:
    requires = [line for line in reader.readlines() if not line.startswith("git+")]

entry_points = {
    'console_scripts': [
        'renom_tag = renom_tag.server:main',
    ]
}

versionpy = os.path.join(DIR, 'renom_tag/__version__.py')
version = re.search(r'"([\d.b]+)"', open(versionpy).read()).group(1)


class BuildNPM(distutils.command.build.build):
    """Custom build command."""

    def run(self):
        shutil.rmtree(os.path.join(DIR, 'renom_tag/.build'), ignore_errors=True)
        curdir = os.getcwd()
        try:
            jsdir = os.path.join(DIR, 'js')

            # skip if js directory not exists.
            if os.path.isdir(jsdir):
                os.chdir(jsdir)
                ret = os.system('npm install')
                if ret:
                    raise RuntimeError('Failed to install npm modules')

                ret = os.system('npm run build')
                if ret:
                    raise RuntimeError('Failed to build npm modules')

        finally:
            os.chdir(curdir)

        super().run()


setup(
    name="renom_tag",
    version=version,
    entry_points=entry_points,
    packages=['renom_tag'],
    install_requires=requires,
    include_package_data=True,
    zip_safe=True,
    cmdclass={
        'build': BuildNPM,
    },
)
