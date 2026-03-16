import Testing
@testable import Vilaro

struct HostEnvSanitizerTests {
    @Test func `sanitize blocks shell trace variables`() {
        let env = HostEnvSanitizer.sanitize(overrides: [
            "SHELLOPTS": "xtrace",
            "PS4": "$(touch /tmp/pwned)",
            "VILARO_TEST": "1",
        ])
        #expect(env["SHELLOPTS"] == nil)
        #expect(env["PS4"] == nil)
        #expect(env["VILARO_TEST"] == "1")
    }

    @Test func `sanitize shell wrapper allows only explicit override keys`() {
        let env = HostEnvSanitizer.sanitize(
            overrides: [
                "LANG": "C",
                "LC_ALL": "C",
                "VILARO_TOKEN": "secret",
                "PS4": "$(touch /tmp/pwned)",
            ],
            shellWrapper: true)

        #expect(env["LANG"] == "C")
        #expect(env["LC_ALL"] == "C")
        #expect(env["VILARO_TOKEN"] == nil)
        #expect(env["PS4"] == nil)
    }

    @Test func `sanitize non shell wrapper keeps regular overrides`() {
        let env = HostEnvSanitizer.sanitize(overrides: ["VILARO_TOKEN": "secret"])
        #expect(env["VILARO_TOKEN"] == "secret")
    }
}
