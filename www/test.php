<?php
require('fpdf.php');

$pdf = new FPDF();
$pdf->AddPage();
$pdf->Image('files/photo/logo.png',20,16,75);

$pdf->SetFont('Arial','B',13);
$pdf->Text(100, 20, 'WKV ENTERTAINMENT');

$pdf->SetFont('Arial','',12);
$pdf->Text(153, 19.8, '(002458475-T)');

$pdf->SetFont('Arial','',11);
$pdf->Text(100, 27, 'No. 29-1, Jalan Semenyih Sentral 3,');
$pdf->Text(100, 32, 'Semenyih Sentral, 43500 Semnyih, Selangor.');

$pdf->SetFont('Arial','B',11);
$pdf->Text(100, 37, 'Telephone :');
$pdf->Text(100, 42, 'Email :');

$pdf->SetFont('Arial','',11);
$pdf->Text(123, 37, '+603 - 8210 7011');
$pdf->Text(114, 42, 'wkvmusicstore@gmail.com');

$pdf->SetLineWidth(1);
$pdf->Line(20, 48, 190, 48);

$pdf->SetFont('Arial','',9);
$pdf->Text(20, 58, ('Inv. No : '.'xxx'));
$pdf->Text(20, 66, 'Company');
$pdf->Text(43, 66, 'xxx-company');
$pdf->Text(20, 71, 'Address');
$pdf->Text(43, 71, 'xxx-address');

$pdf->SetFont('Arial','B',9);
$pdf->Text(112, 71, 'Sales Person');
$pdf->Text(140, 71, ':');
$pdf->Text(112, 76, 'Mobile');
$pdf->Text(140, 76, ':');
$pdf->Text(112, 81, 'Email');
$pdf->Text(140, 81, ':');

$pdf->Text(20, 91, 'Attn');
$pdf->Text(35, 91, ':');
$pdf->Text(37, 91, 'xxx-client-attn');
$pdf->Text(20, 96, 'Email');
$pdf->Text(35, 96, ':');
$pdf->Text(37, 96, 'xxx-client-email');
$pdf->Text(20, 101, 'Tel');
$pdf->Text(35, 101, ':');
$pdf->Text(37, 101, 'xxx-client-tel');
$pdf->Text(20, 106, 'Fax');
$pdf->Text(35, 106, ':');
$pdf->Text(37, 106, 'xxx-client-fax');
$pdf->Text(20, 111, 'Mobile');
$pdf->Text(35, 111, ':');
$pdf->Text(37, 111, 'xxx-client-mobile');

$pdf->SetFont('Arial','',9);
$pdf->Text(142, 71, 'xxx-sales');
$pdf->Text(142, 76, 'xxx-sales-mobile');
$pdf->Text(142, 81, 'wkvmusicstore@gmail.com');

$pdf->Text(112, 91, 'Date');
$pdf->Text(140, 91, ':');
$pdf->Text(142, 91, 'xxx-date');
$pdf->Text(112, 96, 'Total Page(s)');
$pdf->Text(140, 96, ':');
$pdf->Text(142, 96, 'xxx-pages');

$pdf->SetLineWidth(0.1);
$pdf->Line(20, 120, 190, 120);
$pdf->Line(20, 126, 190, 126);
$pdf->Line(30, 120, 30, 234);
$pdf->Line(128, 120, 128, 234);
$pdf->Line(161, 120, 161, 234);
$pdf->Line(20, 120, 20, 234);
$pdf->Line(190, 120, 190, 234);
$pdf->Line(20, 234, 190, 234);

$pdf->SetFont('Arial','B',8);
$pdf->Text(23, 124, 'No');
$pdf->Text(70, 124, 'Description');
$pdf->Text(137, 124, 'Unit Price');
$pdf->Text(168, 124, 'Sub Total');
        
$pdf->SetFont('Arial','',8);
        
$pdf->SetFont('Arial','',9);
$pdf->Text(20, 238, ('Ringgit Malaysia : '.'xxx-money'));
        
$pdf->SetFont('Arial','B',8);
$pdf->SetDrawColor(0);
$pdf->SetFillColor(220,220,220);
$pdf->Rect(20, 241, 170, 14, 'F');

$pdf->Text(25, 245, 'Terms & Conditions');
$pdf->Text(64, 249, 'WKV ENTERTAINMENT');
$pdf->Text(68, 253, '5624  1451  6618');

$pdf->SetFont('Arial','',8);
$pdf->Text(25, 249, '* Make all payment payable to');
$pdf->Text(25, 253, '* Bank information :   - Maybank :');
        
$pdf->SetFont('Arial','B',10);
$pdf->Line(20, 270, 60, 270);
$pdf->Text(20, 275, 'xxx-sales');
$pdf->Text(20, 280, ('H/P : '.'xxx'));
$pdf->Text(20, 285, ('Email : '.'wkvmusicstore@gmail.com'));
        
$pdf->Line(112, 270, 180, 270);
$pdf->Text(112, 275, 'Name : ');

$pdf->SetFont('Times','BI',25);
$pdf->Text(22, 270, 'xxx-sales');

$pdf->Output();
?>