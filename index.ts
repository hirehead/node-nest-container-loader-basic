/// <reference path="_ref.d.ts" />

import fs = require('fs');

class NestContainerLoaderBasic implements Nest.IContainerLoader {

    registrator: Nest.IContainerRegistrator;


    constructor(app: Nest.INest) {
        var registrator = app.modules.filter((x, i, a) => {
            return x.name === 'IContainerRegistrator';
        })[0];

        if (!registrator)
            throw 'IContainerRegistrator was not found on app, but is required for NestContainerRegistratorBasic';

        this.registrator = registrator.instance;
    }

    register(dirname) {

        var walk = (dir) => {
            var results = [];
            var list = fs.readdirSync(dir);

            for (var i = 0; i < list.length; ++i) {
                var file = dir + '/' + list[i];
                var stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    results = results.concat(walk(file));
                } else {
                    results.push(file);
                }
            }

            return results;
        };

        var list = walk(dirname);

        for (var i = 0; i < list.length; ++i) {
            var fl = list[i];

            if (fl[fl.length - 2] !== 'j' || fl[fl.length - 1] !== 's')
                continue;

            var modl = require(list[i]);

            this.registrator.register(modl);

            for (var name in modl)
                this.registrator.register(modl[name]);
        }
    }
}

module.exports.step = function(app: Nest.INest, done: () => any) {
    app.modules.push({
        name: 'IContainerLoader',
        key: 'basic',
        instance: new NestContainerLoaderBasic(app),
    });
}