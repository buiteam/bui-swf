var $ = require('jquery'),
  BUI = require('bui-common'),
  expect = require('expect.js'),
  SWF = require('../index');

function getFlashVars(swf) {
  if (swf.nodeName.toLowerCase() == 'embed') {
    return BUI.unparam(swf.getAttribute('flashvars'));
  } else {
    var params = swf.childNodes, i;
    for (i = 0; i < params.length; i++) {
      var param = params[i];
      if (param.nodeType == 1) {
        if ($(param).attr('name').toLowerCase() == "flashvars") {
          return BUI.unparam($(param).attr("value"));
        }
      }
    }
  }
  return undefined;
}

describe('flash', function () {

  var defaultConfig = {
    attrs: {
      width: 310,
      height: 130,
      alt: "KISSY Flash",
      title: "O Yeah! KISSY Flash!"
    }
  };

  describe('flash player version', function () {
    it("should not less than 9", function () {

      // console.log('flash version: ' + SWF.fpv());

      expect(SWF.fpv()).to.be.ok();
      expect(SWF.fpv().length).to.be(3);
      expect(SWF.fpvGTE(9)).to.be.ok();
      expect(SWF.fpvGTE(9.0)).to.be.ok();
      expect(SWF.fpvGTE('9')).to.be.ok();
      expect(SWF.fpvGTE('9.0.16')).to.be.ok();
      expect(SWF.fpvGTE('9.0 r16')).to.be.ok();
      expect(SWF.fpvGTE(["9", "0", "16"])).to.be.ok();
    });
  });

  describe('create', function () {

    it('can create into body', function (done) {
      var swf1 = new SWF({
        src: 'data/test.swf',
        attrs: {
          id: 'test',
          width: 300,
          height: 300
        },
        params: {
          bgcolor: '#d55867'
        }
      });

      expect(swf1.get('status')).to.be(SWF.Status.SUCCESS);
      expect($(document.body).children().last()[0]).to.be(swf1.get('swfObject'));
      // expect(swf1.get('swfObject').nodeName.toLowerCase()).to.be('object');
      swf1.destroy();

      setTimeout(function () {
        expect($.contains(document.body, swf1.get('swfObject'))).to.be(false);
        done();
      }, 500);
    });


    it('can specify existing container', function (done) {
      var render = $('<div class="test"></div>').appendTo(document.body);
      var swf1 = new SWF({
        src: 'data/test.swf',
        render: render,
        attrs: {
          id: 'test',
          width: 300,
          height: 300
        },
        params: {
          bgcolor: '#d55867'
        }
      });

      expect(swf1.get('status')).to.be(SWF.Status.SUCCESS);

      expect($(swf1.get('swfObject').parentNode).hasClass('test')).to.be(true);

      swf1.destroy();
      setTimeout(function () {
        expect(render.html().toLowerCase()).to.be('');
        done();
      }, 500);
    });

    it("ok with flashvars", function () {
      var config = BUI.merge(BUI.cloneObject(defaultConfig), {
        src: "data/flashvars.swf",
        params: {
          bgcolor: "#038C3C",
          flashvars: {
            name1: 'http://taobao.com/?x=1&z=2',
            name2: {
              s: "string",
              b: false,
              n: 1,
              url: "http://taobao.com/?x=1&z=2",
              cpx: {
                s: "string",
                b: false,
                n: 1,
                url: "http://taobao.com/?x=1&z=2"
              }
            },
            name3: 'string'
          }
        },
        attrs: {
          id: 'test-flash-vars'
        }
      });

      var swf = new SWF(config);
      var flashvars = getFlashVars(swf.get('el'));
      expect(flashvars.name1).to.be('http://taobao.com/?x=1&z=2');
      expect($.parseJSON(flashvars.name2).cpx.s).to.be('string');
      expect(swf.get('el').id).to.be('test-flash-vars');
      swf.destroy();
    });

    it('will handle low version', function () {

      var swf1 = new SWF({
        src: 'data/test.swf',
        attrs: {
          id: 'test',
          width: 300,
          height: 300
        },
        params: {
          // only allow hex
          bgcolor: '#d55867'
        },
        version: '99'
      });

      expect(swf1.get('status')).to.be(SWF.Status.TOO_LOW);

      // expect(SWF.getSrc(swf1.get('el'))).to.be(S.config('base') + 'swf/assets/expressInstall.swf');

    });

  });
});
