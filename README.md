# CSV test suite

Run `npm install`, then `npm test`. Jest runs the tests using `csvtojson`; the library repository is not cloned.

`test.js` loads inputs, expected outputs, and expected messages into arrays in the order listed in `TestData/cases.json`. Each case has a Jest suite with separate output and message checks.

There are exactly 15 cases, numbered like the revised plan. Each has an input in `TestData/TestFiles`, expected JSON in `TestData/ExpectedOutput`, and an expected message in `TestData/ExpectedMessages`. Actual results are saved in `ActualResults` for comparison. A failed case makes the runner exit with status 1.

`TestData/cases.json` lists each case ID and whether its input has a header. RowCount counts data records, excluding the header. Zero-row cases put the requested field contents in the header. Case 11 has one intended headerless record; case 12 has only a header. Neither needs a separator between records. Embedded line breaks use CRLF in these two cases; `RowSeparator = None` refers to separators between records, not line breaks inside fields.

For malformed cases, RowCount and embedded characters describe the intended records and field contents. In cases 8 and 11, unquoted commas become extra field separators; the unquoted line break in case 11 creates an extra physical record. These are rejection tests, since those characters cannot actually belong to an unquoted CSV field. Case 10 is empty, so its AllQuoted partition has no observable effect.

Expected outputs are manually specified. `none` means successful conversion; `error` means any parser error is expected, with JSON `null` representing no completed result. Exact error text is not compared because RFC 4180 does not specify messages. Rejection of malformed input is a test expectation, not a requirement for particular diagnostics in the RFC. The actual diagnostic is saved separately in `.error.txt` files. Some invalid inputs may be accepted by the library, and those tests should fail rather than changing their expectations to match it.

CR and LF record separators are extension cases from the supplied plan. RFC 4180 uses CRLF between records. Headerless tests use `field1` and `field2` as output keys. Column checking is enabled, and trimming is disabled to preserve spaces.

References: [csvtojson documentation](https://github.com/Keyang/node-csvtojson), [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180.txt).
