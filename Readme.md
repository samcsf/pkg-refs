# Pkg-Refs
> Simple tool to take a quick look on given package's dependencies.

## Install
```shell
npm install -g pkg-refs
```

## Usage
Command line tool with short-form pkgd. After a short time, it will list out all the dependecies and the decriptions for them.
```shell
pkgd <package>
```

## Example
```shell
$ pkgd express
----------- Dependencies for express----------------
cookie
> HTTP server cookie parsing and serialization

accepts
> Higher-level content negotiation

content-type
> Create and parse HTTP Content-Type header

content-disposition
> Create and parse Content-Disposition header

array-flatten
> Flatten nested arrays
    :
```