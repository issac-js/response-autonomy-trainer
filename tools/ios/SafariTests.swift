import XCTest

final class SafariTests: XCTestCase {
    private func capture(_ name: String) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }

    private func logStep(_ name: String, safari: XCUIApplication, web: XCUIElement) {
        print("SAFARI_STEP_BEGIN: \(name)")
        print("KEYBOARD_EXISTS: \(safari.keyboards.firstMatch.exists)")
        print("WEB_BUTTON_LABELS: \(web.buttons.allElementsBoundByIndex.map(\.label))")
        let headings = web.staticTexts.matching(NSPredicate(
            format: "label BEGINSWITH %@ OR label BEGINSWITH %@ OR label BEGINSWITH %@",
            "第一步 ·", "第二步 ·", "第三步 ·"
        ))
        print("STEP_H2_ACCESSIBILITY_LABELS: \(headings.allElementsBoundByIndex.map(\.label))")
        print("SAFARI_STEP_END: \(name)")
    }

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
        capture("Before first commit tap")
        logStep("before first commit tap", safari: safari, web: web)
        XCTAssertTrue(commit.isEnabled, "Native typing must enable commit before the first tap")
        commit.tap() // One tap must commit the answer, not merely dismiss the keyboard.
        capture("Immediately after first commit tap")
        logStep("immediately after first commit tap", safari: safari, web: web)
        let skip = web.buttons["跳过分类 · 直接看示范与解析"].firstMatch
        let advanced = skip.waitForExistence(timeout: 10)
        capture("After waiting for strategy step")
        logStep("after waiting for strategy step", safari: safari, web: web)
        if !advanced {
            print("SAFARI_HIERARCHY_BEGIN")
            print(safari.debugDescription)
            print("SAFARI_HIERARCHY_END")
        }
        XCTAssertTrue(advanced, "One enabled commit tap must advance to the strategy step")
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
        XCTAssertFalse(safari.keyboards.firstMatch.exists, "Keyboard must be dismissed after grading")
        XCUIDevice.shared.orientation = .landscapeLeft
        XCTAssertTrue(web.buttons["确认原话 · 查看策略"].firstMatch.waitForExistence(timeout: 10))
        let landscape = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        landscape.name = "Safari landscape"; landscape.lifetime = .keepAlways; add(landscape)
        XCTAssertFalse(safari.keyboards.firstMatch.exists, "Landscape screenshot must show the saved flow without a keyboard")
    }
}
