// ==UserScript==
// @name         pr0gramm comment tracker
// @namespace    https://github.com/x-128/pr0gramm-comment-tracker
// @version      1.0.0
// @description  Adds a field to replies that shows the parent comment on hover.
// @author       x128
// @include      http://pr0gramm.com/*
// @include      https://pr0gramm.com/*
// @grant        none
// ==/UserScript==


(function() {
    "use strict";


    // --------------------------------

    var _fieldText = "[&lt;&lt;]";

    // --------------------------------



    // jQuerify()
    var jQuerify = function(mixed) {
        return mixed instanceof $ ? mixed : $(mixed);
    };


    // commentHelper()
    var commentHelper = {
        name: "commentHelper",
        version: "1.0.0",


        // getName()
        getName: function() {
            return _name;
        },

        // getVersion()
        getVersion: function() {
            return _version;
        },

        // getChildrenOf()
        getChildrenOf: function($comment) {
            return jQuerify($comment).parent().find("> .comment-box > .comment-box-inner > .comment");
        },

        // getParentOf()
        getParentOf: function($comment) {
            return jQuerify($comment).parent().parent().parent().find("> .comment");
        },

        // getContent()
        getContentOf: function($comment) {
            return jQuerify($comment).find("> .comment-content").text().trim();
        },

        // getScore()
        getScoreOf: function($comment) {
            return jQuerify($comment).find(".comment-foot > .score").text().replace(/^(\d+).*$/, "$1");
        },

        // getUpvotes()
        getUpvotesOf: function($comment) {
            return jQuerify($comment).find(".comment-foot > .score").attr("title").replace(/^(\d+).*$/, "$1");
        },

        // getDownvotes()
        getDownvotesOf: function($comment) {
            return jQuerify($comment).find(".comment-foot > .score").attr("title").replace(/^\d+.*?(\d+).*$/, "$1");
        },

        // getTime()
        getTimeOf: function($comment) {
            return jQuerify($comment).find(".comment-foot > .time").attr("title");
        },

        // getTimestamp()
        getTimestampOf: function($comment) {
            var monthResolver = { Jan: "01", Feb: "02", Mär: "03", Apr: "04", Mai: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Okt: "10", Nov: "11", Dez: "12" };
            return this.getTimeOf($comment).replace(/^(..). (...) (\d+) - (.*)$/, function(match, day, month, year, time) {
                return Math.floor(Date.parse(year+"-"+monthResolver[month]+"-"+day+"T"+time)/1000);
            });
        }
    };


    var isInView = function(element) {
        element = element instanceof $ ? element[0] : element;

        var rect = element.getBoundingClientRect();

        return rect.top >= 0 && rect.left >= 0 && rect.bottom <= $(window).height() && rect.right <= $(window).width();
    };

    var processComment = function() {
        var $parent = commentHelper.getParentOf($(this));

        var hoverIn = function() {
            if (isInView($parent)) {
                $parent.addClass("highlight");
            } else {
                var $clone = $parent.clone().attr("id", null).addClass("clone");
                $clone
                    .find(".comment-vote").remove().end()
                    .find(".comment-reply-link").remove().end()
                    .find(".fold").remove().end()
                    .find(".folded-comments-message").remove().end();
                $(this).parent().append($clone);
                $(".clone").offset({
                    top: $(this).offset().top,
                    left: $(this).offset().left + $(this).width() + 10
                });
            }
        };

        var hoverOut = function() {
            $parent.removeClass("highlight");
            $(".clone").remove();
        };

        $(this).find(".comment-foot").append(
            $('<span class="show-parent action">'+_fieldText+'</span>').hover(hoverIn, hoverOut).click(function() {
                $parent.find(".permalink").click();
            })
        );

        commentHelper.getChildrenOf($(this)).each(processComment);
    };

    var run = function() {
        $(".comments").each(function() {
            if (!$(this).hasClass("tracked")) {
                $(this).addClass("tracked");

                $(".comments > .comment-box > .comment-box-inner > .comment").each(function() {
                    commentHelper.getChildrenOf($(this)).each(processComment);
                });
            }
        });
    };


    window.onload = function() {
        if ("undefined" === typeof $) {
            throw "jQuery not found";
        }

        $("head").append("<style>"+
                         ".highlight{background:#666!important}"+
                         ".clone{background:#161618!important;position:absolute!important;z-index:1}"+
                         ".clone>.comment-content{color:#f2f5f4!important}"+
                         ".clone>.comment-foot{border:0!important}</style>"
                        );

        $(document).ajaxComplete(function(event, response, settings) {
            if (settings.url.indexOf("api/items/info") > 0) {
                run();
            }
        });

        run();
    };
})();
