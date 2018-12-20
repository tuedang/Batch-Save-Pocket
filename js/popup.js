(function()
{
    var rowTemplate = `
        <tr>
            <td>{{index}}</td>
            <td><input type="checkbox" checked /></td>
            <td><input type = "text" style = "max-width:150px" value = "{{title}}"/></td>
            <td><a href = '{{url}}' target='_blank'>{{url}}</a></td>
            <!--<td><input type = "text" style = "max-width:150px"/></td>-->
        </tr>
    `;

    function buildLinks(links) {
        var urls = links.urls;
        var titles = links.titles;
        $('#no-link-content').hide();
        $('#link-content').show();

        $tableBody = $('#mytable > tbody');
        $tableBody.empty();
        for (var i = 0; i < urls.length; i++) {
            let rowContent = rowTemplate
                .replace(/{{index}}/g, i)
                .replace(/{{url}}/g, urls[i])
                .replace(/{{title}}/g, titles[i]);
            $tableBody.append(rowContent);
        }

        //$('.toggable').hide();
        $('#link-content').show();
    }
    function single_submit_handler()
    {
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs)
        {
            var current_url = tabs[0].url;
            var tags = $('#single-tag').val();
            var actions = [];
            var row =
            {
                "tags" : tags,
                "url" : current_url,
                "action" : "add",
            };
            actions.push(row);
            PocketAPI.modify(actions);
        });
    }
    function pocket_button_handler()
    {
        chrome.tabs.create({'url': 'http://getpocket.com/a/queue/list/'});
    }
    function submit_button_handler()
    {
        var common_tags = $('#common-tags').val();
        var actions = [];
        var unix_timestamp = Math.round((new Date()).getTime() / 1000);
        $('input:checkbox:checked').each(function(index) {
            var title = $(this).parent().next();
            var link = title.next();
            var tags = '';//disable //link.next()[0].children[0].value;
            //var tags = link.nextSibling;
            title = title.text();
            link = link.text();
            if(common_tags.length > 0) {
                if (tags) {
                    tags = tags + ',' + common_tags;
                } else {
                    tags = common_tags;
                }
            }
            var row = {
                "tags" : tags,
                "title" : title,
                "url" : link,
                "action" : "add",
                "time" : '' + (unix_timestamp-index)
                //those above in last will have max time and therefore will appear up in Pocket interfaces
            };
            actions.push(row);
        });
        PocketAPI.modify(actions);
    }

    //taken from http://stackoverflow.com/questions/161738/what-is-the-best-regular-expression-to-check-if-a-string-is-a-valid-url
    //the RegexBuddy answer
    var regex =  /\b(https?|ftp|file):\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;]*[\-A-Za-z0-9+&@#\/%=~_|‌​]/gi;
    function parse_submit_handler()
    {
        var text = $('#links').val();
        var urls = text.match(regex);
        if(!urls || urls.length === 0)
        {
            $('#paste-error').text('Please enter a valid list').show();
            return;
        }
        var titles = [];
        for(var i = 0; i < urls.length; i++)
        {
            titles.push('');
        }
        var req = {"urls" : urls, "titles" : titles};
        buildLinks(req);
    }
    function logout_hander()
    {
        Auth.logout();
    }

    function parseLinkFromSelector(e) {
        var selector = $('#css-selector').val();
        chrome.tabs.executeScript(null, {
            code: 'var selector = "' + selector + '";'
        }, function() {
            chrome.tabs.executeScript(null, {file: 'js/extract_link_by_selector.js'});
        });
    }

    $(document).ready(function() {

        if(!Auth.isAuthenticated())
        {
            Auth.authenticate();
        }
        $('.pocket-button').click(pocket_button_handler); //common to both
        $('#submit-single-button').click(single_submit_handler);
        $('#submit-button').click(submit_button_handler);
        $('#parse-links').click(parse_submit_handler);
        $('a#logout').click(logout_hander);
        $('body').on('click', 'a.link', function(){  //set up hyperlinks in popup.html as chrome blocks them
            chrome.tabs.create({url: $(this).attr('href')});
            return false;
        });
        chrome.tabs.executeScript(null, {file:"js/script.js"});

        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                buildLinks(request);
        });

        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            var url = tabs[0].url;

            var domain = url.split("/")[2];

            var $detectedDomain = $('#css-selector-content .link[domain="' + domain + '"]');
            if ($detectedDomain.length === 1) {
                $detectedDomain.click();
                parseLinkFromSelector();
            }
        });

        $('#verify-selector-button').click(() => {
            parseLinkFromSelector();
        });

        var domainLinks = $('#css-selector-content .link');
        $('#css-selector-content .link').click(function(e) {
            domainLinks.removeClass('active');
            $('#css-selector').val($(this).attr('data'));
            $(this).toggleClass("active");
            return false;
        });

        $('#mytable #allcheck').click(function (e) {
            var checked = $(this).is(":checked");
            $('#mytable input[type="checkbox"]').prop('checked', checked);
        });
    });
})();
