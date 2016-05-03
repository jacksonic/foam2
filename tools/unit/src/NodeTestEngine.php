<?php

/**
 * Basic wrapper for "npm run coverage".
 *
 * Only captures the log and checks the exit code. It doesn't really parse the
 * output.
 */
final class NodeTestEngine extends ArcanistUnitTestEngine {
  private $projectRoot;

  public function run() {
    $working_copy = $this->getWorkingCopy();
    $this->projectRoot = $working_copy->getProjectRoot();

    $future = new ExecFuture('npm run coverage');
    $future->setCWD($this->projectRoot);
    list($err, $stdout, $stderr) = $future->resolve();

    $result = new ArcanistUnitTestResult();
    $result->setName("Node test engine");
    $result->setUserData($stdout);

    if ( $err ) {
      $result->setResult(ArcanistUnitTestResult::RESULT_FAIL);
    } else {
      $result->setResult(ArcanistUnitTestResult::RESULT_PASS);
    }
    return array($result);
  }
}

?>
