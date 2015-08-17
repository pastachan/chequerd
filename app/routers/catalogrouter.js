/**
 * Copyright (c) 2015, Cornellapp.
 * All rights reserved.
 *
 * This source code is licensed under the GNU General Public License v3.0
 * license found in the LICENSE file in the root directory of this source
 * tree.
 *
 *
 * Router submodule for handling all catalog routes.
 */

 var async = require('async');

var catalogrouter = function(app) {
    var models = app.get('models'),
        knex = app.get('knex'),
        apiutil = require('../utils/apiutil')(models),
        _ = require('underscore');

    // Route for rendering all of the available departments.
    app.get('/catalog/:strm/departments', function(req, res) {
        var strm = req.params.strm;

        new models.semester({ strm: strm }).fetch().then(function(s) {
            if (!s)
                return res.send('An error occured.');

            res.render('catalog', {
                title: 'All Departments',
                type: 'departments',
                data: JSON.parse(s.get('subject_list')),
                _: _
            });
        });
    });

    // Route for rendering all of the courses for a department.
    app.get('/catalog/:strm/department/:department', function(req, res) {
        var strm = req.params.strm,
            department = req.params.department.toUpperCase();

        new models.course().where('strm', strm).where('subject', department)
            .fetchAll().then(function(courses) {
            if (!courses.length)
                return res.send('An error occured.');

            new models.semester({ strm: strm }).fetch().then(function(ss) {
                var s = _.find(JSON.parse(ss.get('subject_list')), function(s) {
                    return s.value === department;
                });

                var cs = courses.toJSON();

                async.map(cs, function(c, callback) {
                    knex.table('likes').where('crseId', c.crseId).select()
                        .then(function(ls) {
                            callback(null, ls);
                        });
                }, function(err, results) {
                    res.render('catalog', {
                        title: s.descrformal,
                        type: 'department',
                        courses: courses,
                        likes: results,
                        user: req.user ? req.user.id : false,
                        _: _
                    });
                });
            });
        });
    });

    // Route for the page of a single course
    app.get('/catalog/:strm/course/:subject/:number', function(req, res) {
        var strm = req.params.strm,
            subject = req.params.subject.toUpperCase(),
            number = req.params.number;

        new models.course({ strm: strm, subject: subject, catalogNbr: number })
            .fetch({ withRelated: ['groups.sections.meetings.professors'] })
            .then(function(c) {
                if (!c)
                    return res.send('An error occured.');

                knex.table('likes').where('crseId', c.get('crseId')).select()
                    .then(function(like) {
                        res.render('catalog', {
                            title: subject + ' ' + number,
                            type: 'course',
                            course: c,
                            like: like,
                            user: req.user ? req.user.id : false,
                            _: _
                        });
                    });
            });
    });

    // Route for searching the catalog.
    app.get('/catalog/:strm/search/:term', function(req, res) {
        var p = {
            query: req.params.term,
            strm: req.params.strm
        };

        apiutil.searchCourses(p, 20, function(err, results) {
            var cs = results.toJSON();

            async.map(cs, function(c, callback) {
                knex.table('likes').where('crseId', c.crseId).select()
                    .then(function(ls) {
                        callback(null, ls);
                    });
            }, function(err, likes) {
                res.render('catalog', {
                    title: '"' + req.params.term + '"',
                    type: 'department',
                    courses: results,
                    likes: likes,
                    user: req.user ? req.user.id : false,
                    _: _
                });
            });
        }, true);
        // res.send('ok');
    });

    // Route for searching random courses.
    app.get('/catalog/:strm/random', function(req, res) {
        new models.course().query(function(qb) {
            qb.orderByRaw('RAND()').limit(20);
        }).fetchAll().then(function(courses) {

                var cs = courses.toJSON();

                async.map(cs, function(c, callback) {
                    knex.table('likes').where('crseId', c.crseId).select()
                        .then(function(ls) {
                            callback(null, ls);
                        });
                }, function(err, likes) {
                    res.render('catalog', {
                        title: 'Random Courses',
                        type: 'department',
                        courses: courses,
                        likes: likes,
                        user: req.user ? req.user.id : false,
                        _: _
                    });
                });

            });
    });
};

module.exports = catalogrouter;
