'use strict';

const Hapi = require('hapi');
const Joi = require('joi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

const options = {
    info: {
        'title': 'commands-http API documentation',
        'version': Pack.version
    }
};

server.route({
    method: 'GET',
    path: '/man/{page}/{section?}',
    handler: function (request, reply) {
        const  execfile = require( 'child_process' ).execFile;
        var params = [ '-P', 'cat'];

        if (request.params['section']) {
            params = params.concat([ request.params['section'] ]);
        }

        params = params.concat([ request.params['page'] ]);
        var ls = execfile( 'man', params );
        reply(ls.stdout);
                 },
    config: {
        description: 'Read a man page.',
        notes: 'Returns the man page specified, section optional.',
        tags: ['api'],
        validate: {
            params: {
                page: Joi.string().alphanum().min(1).max(40),
                section: Joi.number()
            }
        }
    }
});


server.register([
    Inert,
    Vision,
    {
        'register': HapiSwagger,
        'options': options
    }], (err) => {
        server.start( (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Server running at:', server.info.uri);
            }
        });
    });
