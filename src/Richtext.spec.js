/* global createUsers, databases, wait, compareAllUsers, getRandom, getRandomString, getRandomNumber, applyRandomTransactionsNoGCNoDisconnect, applyRandomTransactionsAllRejoinNoGC, applyRandomTransactionsWithGC, async, describeManyTimes */
/* eslint-env browser,jasmine */
'use strict'

var Y = require('../../yjs/src/SpecHelper.js')
require('./Richtext.js')(Y)
var Quill = require('quill')

var numberOfYRichtextTests = 500
var repeatRichtextTests = 100

if (typeof window !== 'undefined') {
  for (let database of databases) {
    describe(`Richtext Type (DB: ${database})`, function () {
      var y1, y2, y3, yconfig1, yconfig2, yconfig3, flushAll // eslint-disable-line

      beforeEach(async(function * (done) {
        yield createUsers(this, 3, database)
        y1 = (yconfig1 = this.users[0]).share.root
        y2 = (yconfig2 = this.users[1]).share.root
        y3 = (yconfig3 = this.users[2]).share.root
        flushAll = Y.utils.globalRoom.flushAll
        yield wait(10)
        done()
      }))
      afterEach(async(function * (done) {
        yield compareAllUsers(this.users)
        done()
      }))
      describeManyTimes(repeatRichtextTests, `Random tests`, function () {
        var randomTextTransactions = [
          function insert (s) {
            var e = s.instances[0].editor
            e.insertText(getRandomNumber(e.getText().length), getRandomString())
          },
          function _delete (s) {
            var q = s.instances[0].editor
            var len = q.getText().length
            var from = getRandomNumber(len)
            var delLength = getRandomNumber(len - from)
            var to = from + Math.min(7, delLength)
            q.deleteText(from, to)
          },
          function select (s) {
            var q = s.instances[0].editor
            var len = q.getText().length
            var from = getRandomNumber(len)
            var to = from + getRandomNumber(len - from)
            var attr = getRandom(['bold', 'italic', 'strike'])
            var val = getRandom([true, false])
            q.formatText(from, to, attr, val)
          }
        ]
        function compareValues (vals) {
          var firstContent
          for (var l of vals) {
            var e = l.instances[0].editor
            var content = e.getContents(0, l.length - 1)
            console.log(e.getText(), l.length)
            if (firstContent == null) {
              firstContent = content
            } else {
              expect(content).toEqual(firstContent)
            }
          }
        }
        beforeEach(async(function * (done) {
          yield this.users[0].share.root.set('Richtext', Y.Richtext)
          yield flushAll()
          var promises = []
          for (var u = 0; u < this.users.length; u++) {
            promises.push(this.users[u].share.root.get('Richtext'))
          }
          this.texts = yield Promise.all(promises)
          for (var t of this.texts) {
            t.bind(new Quill(document.createElement('div')))
          }
          done()
        }))
        it('arrays.length equals users.length', async(function * (done) {
          expect(this.texts.length).toEqual(this.users.length)
          done()
        }))
        it(`succeed after ${numberOfYRichtextTests} actions, no GC, no disconnect`, async(function * (done) {
          yield applyRandomTransactionsNoGCNoDisconnect(this.users, this.texts, randomTextTransactions, numberOfYRichtextTests)
          yield flushAll()
          yield compareValues(this.texts)
          yield compareAllUsers(this.users)
          done()
        }))
        it(`succeed after ${numberOfYRichtextTests} actions, no GC, all users disconnecting/reconnecting`, async(function * (done) {
          yield applyRandomTransactionsAllRejoinNoGC(this.users, this.texts, randomTextTransactions, numberOfYRichtextTests)
          yield flushAll()
          yield compareValues(this.texts)
          yield compareAllUsers(this.users)
          done()
        }))
        it(`succeed after ${numberOfYRichtextTests} actions, GC, user[0] is not disconnecting`, async(function * (done) {
          yield applyRandomTransactionsWithGC(this.users, this.texts, randomTextTransactions, numberOfYRichtextTests)
          yield flushAll()
          yield compareValues(this.texts)
          yield compareAllUsers(this.users)
          done()
        }))
      })
    })
  }
}
