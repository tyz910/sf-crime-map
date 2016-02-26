<?php

$file = new SplFileObject(__DIR__ . '/../data/train.csv');
$data = [];
$prevYear = $prevWeek = '';

$num = 0;
while ($row = $file->fgetcsv()) {
    if ($num && $row[0]) {
        $date = new \DateTime($row[0]);
        $year = $date->format('Y');
        $week = $date->format('W');

        if ($week != $prevWeek) {
            save($data, $prevYear, $prevWeek);
            $data = [];
        }

        $data[$row[1]][] = [
            'Date'       => $row[0],
            'Hour'       => $date->format('H'),
            'DayOfWeek'  => $row[3],
            'Descript'   => $row[2],
            'PdDistrict' => $row[4],
            'Resolution' => $row[5],
            'Address'    => $row[6],
            'X'          => $row[7],
            'Y'          => $row[8],
        ];


        $prevYear = $year;
        $prevWeek = $week;
    }

    $num++;
}

save($data, $year, $week);

function save($data, $year, $week)
{
    echo "$year - $week\n";
    $dir = __DIR__ . "/dates/{$year}";
    if (!is_dir($dir)) {
        mkdir($dir);
    }

    file_put_contents($dir . "/{$week}.json", json_encode($data));
}
