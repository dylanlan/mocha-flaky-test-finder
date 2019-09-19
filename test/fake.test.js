const chai = require('chai');  
const expect = chai.expect;
const Chance = require('chance');
const chance = new Chance();


describe('thing', function() {
    it('should succeed', function() {
        expect(chance.natural({min: 1, max: 100})).to.be.lessThan(100);
    });
});