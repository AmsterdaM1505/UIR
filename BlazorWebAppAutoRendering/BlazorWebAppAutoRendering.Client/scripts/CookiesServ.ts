interface Window {
    cookiesInterop: {
        setCookie: (name: string, value: string, days?: number) => void;
        getCookie: (name: string) => string | null;
        eraseCookie: (name: string) => void;
    };
}

window.cookiesInterop = {
    setCookie: function (name, value, days) { //ключ значение, срок хранения
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    },

    getCookie: function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    eraseCookie: function (name) {
        document.cookie = name + '=; Max-Age=-99999999;';
    }
};
