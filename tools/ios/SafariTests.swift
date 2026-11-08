import XCTest

final class SafariTests: XCTestCase {
    func testNativeRecallKeyboardAndGrading() throws {
        continueAfterFailure = false
        XCUIDevice.shared.orientation = .portrait
        let launcher = XCUIApplication()
        launcher.launchEnvironment["RAT_FIXTURE_URL"] = "http://127.0.0.1:8765/"
        launcher.launch()
        let safari = XCUIApplication(bundleIdentifier: "com.apple.mobilesafari")
        XCTAssertTrue(safari.webViews.firstMatch.waitForExistence(timeout: 60))
        let web = safari.webViews.firstMatch
        let start = web.buttons["开始今日训练"].firstMatch
        XCTAssertTrue(start.waitForExistence(timeout: 30))
        start.tap()
        let reply = web.textViews.firstMatch
        XCTAssertTrue(reply.waitForExistence(timeout: 10))
        reply.tap()
        XCTAssertTrue(safari.keyboards.firstMatch.waitForExistence(timeout: 5))
        reply.typeText("I will confirm the facts.")
        let commit = web.buttons["确认原话 · 查看策略"].firstMatch
        for _ in 0..<6 {
            if commit.isHittable { break }
            web.swipeUp()
        }
        XCTAssertTrue(commit.isHittable)
        commit.tap() // One tap must commit the answer, not merely dismiss the keyboard.
        let skip = web.buttons["跳过分类 · 直接看示范与解析"].firstMatch
        XCTAssertTrue(skip.waitForExistence(timeout: 10))
        for _ in 0..<8 {
            if skip.isHittable { break }
            web.swipeUp()
        }
        skip.tap()
        let grade = web.buttons.matching(NSPredicate(format: "label CONTAINS %@", "独立做到")).firstMatch
        XCTAssertTrue(grade.waitForExistence(timeout: 10))
        XCTAssertTrue(grade.isHittable)
        grade.tap()
        let saved = web.staticTexts["本题已保存，可继续下一题或返回。"].firstMatch
        XCTAssertTrue(saved.waitForExistence(timeout: 10))
        let portrait = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        portrait.name = "Safari recall saved"; portrait.lifetime = .keepAlways; add(portrait)
        XCUIDevice.shared.orientation = .landscapeLeft
        XCTAssertTrue(web.buttons["确认原话 · 查看策略"].firstMatch.waitForExistence(timeout: 10))
        let landscape = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        landscape.name = "Safari landscape"; landscape.lifetime = .keepAlways; add(landscape)
    }
}
